import { getKeyState } from './adaptiveCooldown.js';
import { getPoolFingerprint } from './visitorKeyParser.js';

// Isolated cursor tracking per visitor pool ID or fingerprint
const poolCursorMap = new Map<string, number>();

export interface ScheduledKeyOption {
  key: string;
  maskedId: string;
}

export class VisitorKeyScheduler {
  private candidateKeys: string[];
  private attemptedKeys: Set<string>;
  private poolId: string;
  private requestSequence?: number;

  constructor(keys: string[], customPoolId?: string, requestSequence?: number) {
    // Preserve user order, filter empty/deduplicate
    const uniqueKeys: string[] = [];
    for (const k of keys) {
      const trimmed = k ? k.trim() : '';
      if (trimmed && !uniqueKeys.includes(trimmed)) {
        uniqueKeys.push(trimmed);
      }
    }

    this.candidateKeys = uniqueKeys;
    this.attemptedKeys = new Set<string>();
    this.poolId = customPoolId && customPoolId.trim() ? customPoolId.trim() : getPoolFingerprint(this.candidateKeys);
    this.requestSequence = typeof requestSequence === 'number' && requestSequence >= 0 ? requestSequence : undefined;
  }

  public getPoolId(): string {
    return this.poolId;
  }

  public getCandidateCount(): number {
    return this.candidateKeys.length;
  }

  /**
   * Selects the next eligible key using Round Robin for THIS specific pool,
   * skipping keys in COOLDOWN or INVALID within this pool.
   * Updates cursor to (selectedIndex + 1) % total ONLY after finding the chosen key.
   */
  public getNextEligibleKey(): ScheduledKeyOption | null {
    if (this.candidateKeys.length === 0) return null;

    const total = this.candidateKeys.length;
    let startOffset: number;

    const storedCursor = poolCursorMap.get(this.poolId);
    if (storedCursor !== undefined) {
      startOffset = storedCursor % total;
    } else if (this.requestSequence !== undefined) {
      startOffset = this.requestSequence % total;
    } else {
      startOffset = 0;
    }

    for (let i = 0; i < total; i++) {
      const idx = (startOffset + i) % total;
      const apiKey = this.candidateKeys[idx];

      if (this.attemptedKeys.has(apiKey)) {
        continue;
      }

      const state = getKeyState(apiKey, this.poolId);
      if (state.status === 'READY') {
        this.attemptedKeys.add(apiKey);
        // Advance cursor to the index immediately following the selected key
        poolCursorMap.set(this.poolId, (idx + 1) % total);
        return { key: apiKey, maskedId: state.maskedId };
      }
    }

    return null;
  }

  public hasUntriedKeys(): boolean {
    return this.candidateKeys.some((k) => !this.attemptedKeys.has(k));
  }
}
