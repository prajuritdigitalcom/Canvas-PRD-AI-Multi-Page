import { getKeyState } from './adaptiveCooldown.js';

let globalCursor = 0;

export interface ScheduledKeyOption {
  key: string;
  maskedId: string;
}

export class VisitorKeyScheduler {
  private candidateKeys: string[];
  private attemptedKeys: Set<string>;

  constructor(keys: string[]) {
    this.candidateKeys = Array.from(new Set(keys.map((k) => k.trim()).filter(Boolean)));
    this.attemptedKeys = new Set<string>();
  }

  public getCandidateCount(): number {
    return this.candidateKeys.length;
  }

  /**
   * Selects the next eligible key using Round Robin, skipping keys in COOLDOWN or INVALID.
   * Guarantees that each candidate key in the visitor's pool is attempted at most once per request.
   */
  public getNextEligibleKey(): ScheduledKeyOption | null {
    if (this.candidateKeys.length === 0) return null;

    const total = this.candidateKeys.length;
    // Advance global cursor for fair start index across incoming requests
    const startOffset = globalCursor % total;
    globalCursor = (globalCursor + 1) % 1000000;

    for (let i = 0; i < total; i++) {
      const idx = (startOffset + i) % total;
      const apiKey = this.candidateKeys[idx];

      if (this.attemptedKeys.has(apiKey)) {
        continue;
      }

      const state = getKeyState(apiKey);
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
