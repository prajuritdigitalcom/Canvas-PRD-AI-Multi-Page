import { getKeyState } from './adaptiveCooldown.js';
import { getPoolFingerprint } from './visitorKeyParser.js';

// Isolated cursor tracking per visitor key pool fingerprint
const poolCursorMap = new Map<string, number>();

export interface ScheduledKeyOption {
  key: string;
  maskedId: string;
}

export class VisitorKeyScheduler {
  private candidateKeys: string[];
  private attemptedKeys: Set<string>;
  private poolFingerprint: string;

  constructor(keys: string[]) {
    this.candidateKeys = Array.from(new Set(keys.map((k) => k.trim()).filter(Boolean)));
    this.attemptedKeys = new Set<string>();
    this.poolFingerprint = getPoolFingerprint(this.candidateKeys);
  }

  public getPoolFingerprint(): string {
    return this.poolFingerprint;
  }

  public getCandidateCount(): number {
    return this.candidateKeys.length;
  }

  /**
   * Selects the next eligible key using Round Robin for THIS specific pool,
   * skipping keys in COOLDOWN or INVALID within this pool.
   * Guarantees that each candidate key in the visitor's pool is attempted at most once per request cycle.
   */
  public getNextEligibleKey(): ScheduledKeyOption | null {
    if (this.candidateKeys.length === 0) return null;

    const total = this.candidateKeys.length;
    const currentCursor = poolCursorMap.get(this.poolFingerprint) || 0;
    const startOffset = currentCursor % total;

    // Advance cursor for THIS pool only
    poolCursorMap.set(this.poolFingerprint, (currentCursor + 1) % total);

    for (let i = 0; i < total; i++) {
      const idx = (startOffset + i) % total;
      const apiKey = this.candidateKeys[idx];

      if (this.attemptedKeys.has(apiKey)) {
        continue;
      }

      const state = getKeyState(apiKey, this.poolFingerprint);
      if (state.status === 'READY') {
        this.attemptedKeys.add(apiKey);
        return { key: apiKey, maskedId: state.maskedId };
      }
    }

    return null;
  }

  public hasUntriedKeys(): boolean {
    return this.candidateKeys.some((k) => !this.attemptedKeys.has(k));
  }
}
