import { maskApiKey } from './visitorKeyParser.js';

export interface KeyState {
  maskedId: string;
  status: 'READY' | 'COOLDOWN' | 'INVALID';
  cooldownUntil: number;
  failureCount: number;
  lastErrorType?: string;
}

// In-memory local cooldown map using key hashes / masked IDs
// Note: This serves as best-effort local optimization on server instances
const keyStateMap = new Map<string, KeyState>();

/**
 * Creates a simple non-reversible hash / key identifier for state tracking without storing raw key
 */
function getKeyHash(apiKey: string): string {
  let hash = 0;
  for (let i = 0; i < apiKey.length; i++) {
    hash = (hash << 5) - hash + apiKey.charCodeAt(i);
    hash |= 0;
  }
  return `key_${Math.abs(hash)}_${apiKey.slice(-4)}`;
}

export function getKeyState(apiKey: string): KeyState {
  const hash = getKeyHash(apiKey);
  const now = Date.now();
  let state = keyStateMap.get(hash);

  if (!state) {
    state = {
      maskedId: maskApiKey(apiKey),
      status: 'READY',
      cooldownUntil: 0,
      failureCount: 0,
    };
    keyStateMap.set(hash, state);
  } else if (state.status === 'COOLDOWN' && now >= state.cooldownUntil) {
    state.status = 'READY';
  }

  return state;
}

export function markKeyCooldown(apiKey: string, retryAfterMs?: number | null, reason?: string): KeyState {
  const hash = getKeyHash(apiKey);
  const state = getKeyState(apiKey);
  const now = Date.now();

  state.failureCount += 1;
  state.status = 'COOLDOWN';
  state.lastErrorType = reason || 'Rate Limit / Quota Exceeded';

  if (retryAfterMs && retryAfterMs > 0) {
    state.cooldownUntil = now + retryAfterMs;
  } else {
    // Exponential backoff + jitter (base 15s, max 300s, jitter 1000-3000ms)
    const baseMs = 15000;
    const maxMs = 300000;
    const exp = Math.min(baseMs * Math.pow(2, state.failureCount - 1), maxMs);
    const jitter = Math.floor(Math.random() * 2000) + 1000;
    state.cooldownUntil = now + Math.min(exp + jitter, maxMs);
  }

  keyStateMap.set(hash, state);
  return state;
}

export function markKeyInvalid(apiKey: string, reason?: string): KeyState {
  const hash = getKeyHash(apiKey);
  const state = getKeyState(apiKey);

  state.status = 'INVALID';
  state.lastErrorType = reason || 'Invalid Credential';
  keyStateMap.set(hash, state);
  return state;
}

export function markKeySuccess(apiKey: string): KeyState {
  const hash = getKeyHash(apiKey);
  const state = getKeyState(apiKey);

  state.status = 'READY';
  state.failureCount = 0;
  state.cooldownUntil = 0;
  state.lastErrorType = undefined;
  keyStateMap.set(hash, state);
  return state;
}
