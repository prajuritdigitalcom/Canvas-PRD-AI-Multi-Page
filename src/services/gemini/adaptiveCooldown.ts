import { maskApiKey, hashKey } from './visitorKeyParser.js';

export interface KeyState {
  maskedId: string;
  status: 'READY' | 'COOLDOWN' | 'INVALID';
  cooldownUntil: number;
  failureCount: number;
  lastErrorType?: string;
  lastSeenAt: number;
}

// Maximum cooldown period capped at 5 minutes (300,000 ms)
export const MAX_COOLDOWN_MS = 300000;
const MAX_TRACKED_ENTRIES = 500;
const STALE_TTL_MS = 3600000; // 1 hour

// In-memory local cooldown map scoped by poolId + keyHash
const keyStateMap = new Map<string, KeyState>();

/**
 * Periodically cleans up stale or excessive in-memory key states to prevent memory leaks.
 */
function cleanupOldStates() {
  const now = Date.now();
  if (keyStateMap.size <= MAX_TRACKED_ENTRIES) return;

  for (const [key, state] of keyStateMap.entries()) {
    if (state.status !== 'COOLDOWN' && now - state.lastSeenAt > STALE_TTL_MS) {
      keyStateMap.delete(key);
    }
  }

  if (keyStateMap.size > MAX_TRACKED_ENTRIES) {
    const entries = Array.from(keyStateMap.entries())
      .filter(([_, s]) => s.status !== 'COOLDOWN')
      .sort((a, b) => a[1].lastSeenAt - b[1].lastSeenAt);

    const toDelete = entries.slice(0, keyStateMap.size - MAX_TRACKED_ENTRIES);
    for (const [k] of toDelete) {
      keyStateMap.delete(k);
    }
  }
}

/**
 * Creates a cryptographically secure scoped key identifier for state tracking.
 * Strictly scoped by poolId (e.g. visitorPoolId or poolFingerprint) to ensure Visitor Isolation.
 */
function getScopedKeyHash(apiKey: string, poolId: string = 'global'): string {
  const kHash = hashKey(apiKey);
  return `${poolId}::${kHash}`;
}

export function getKeyState(apiKey: string, poolId: string = 'global'): KeyState {
  cleanupOldStates();
  const hash = getScopedKeyHash(apiKey, poolId);
  const now = Date.now();
  let state = keyStateMap.get(hash);

  if (!state) {
    state = {
      maskedId: maskApiKey(apiKey),
      status: 'READY',
      cooldownUntil: 0,
      failureCount: 0,
      lastSeenAt: now,
    };
    keyStateMap.set(hash, state);
  } else {
    state.lastSeenAt = now;
    if (state.status === 'COOLDOWN' && now >= state.cooldownUntil) {
      state.status = 'READY';
    }
  }

  return state;
}

export function markKeyCooldown(
  apiKey: string,
  poolId: string = 'global',
  retryAfterMs?: number | null,
  reason?: string
): KeyState {
  const hash = getScopedKeyHash(apiKey, poolId);
  const state = getKeyState(apiKey, poolId);
  const now = Date.now();

  state.failureCount += 1;
  state.status = 'COOLDOWN';
  state.lastErrorType = reason || 'Rate Limit / Quota Exceeded';
  state.lastSeenAt = now;

  if (retryAfterMs && retryAfterMs > 0) {
    state.cooldownUntil = now + Math.min(retryAfterMs, MAX_COOLDOWN_MS);
  } else {
    // Exponential backoff + jitter (base 15s, max 300s, jitter 1000-3000ms)
    const baseMs = 15000;
    const exp = Math.min(baseMs * Math.pow(2, state.failureCount - 1), MAX_COOLDOWN_MS);
    const jitter = Math.floor(Math.random() * 2000) + 1000;
    state.cooldownUntil = now + Math.min(exp + jitter, MAX_COOLDOWN_MS);
  }

  keyStateMap.set(hash, state);
  return state;
}

export function markKeyInvalid(
  apiKey: string,
  poolId: string = 'global',
  reason?: string
): KeyState {
  const hash = getScopedKeyHash(apiKey, poolId);
  const state = getKeyState(apiKey, poolId);

  state.status = 'INVALID';
  state.lastErrorType = reason || 'Invalid Credential';
  state.lastSeenAt = Date.now();
  keyStateMap.set(hash, state);
  return state;
}

export function markKeySuccess(
  apiKey: string,
  poolId: string = 'global'
): KeyState {
  const hash = getScopedKeyHash(apiKey, poolId);
  const state = getKeyState(apiKey, poolId);

  state.status = 'READY';
  state.failureCount = 0;
  state.cooldownUntil = 0;
  state.lastErrorType = undefined;
  state.lastSeenAt = Date.now();
  keyStateMap.set(hash, state);
  return state;
}
