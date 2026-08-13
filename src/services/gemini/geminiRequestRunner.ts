import { GoogleGenAI } from '@google/genai';
import { VisitorKeyScheduler } from './visitorKeyScheduler.js';
import { classifyGeminiError } from './geminiErrorClassifier.js';
import { markKeyCooldown, markKeyInvalid, markKeySuccess } from './adaptiveCooldown.js';

export interface GeminiRunnerContext {
  keys: string[];
  candidateModels: string[];
  executor: (ai: GoogleGenAI, apiKey: string, model: string) => Promise<any>;
}

export interface GeminiRunnerResult<T> {
  data: T;
  modelUsed: string;
  keyUsedMasked: string;
}

/**
 * Shared Request Runner for Gemini operations using strictly Visitor API Keys.
 * Handles Round Robin selection, Failover across visitor keys, and Adaptive Cooldown.
 */
export async function runGeminiWithVisitorKeys<T>({
  keys,
  candidateModels,
  executor,
}: GeminiRunnerContext): Promise<GeminiRunnerResult<T>> {
  if (!keys || keys.length === 0) {
    throw new Error('Tidak ada API Key yang tersedia. Masukkan API Key Gemini pribadi Anda di menu Sistem & API Key.');
  }

  const scheduler = new VisitorKeyScheduler(keys);
  let lastError: any = null;

  while (true) {
    const selected = scheduler.getNextEligibleKey();

    if (!selected) {
      // No eligible ready key remaining in this request cycle
      if (lastError) {
        const classified = classifyGeminiError(lastError);
        if (classified.statusCode === 429) {
          throw new Error('Semua API Key Gemini Anda sedang mengalami rate limit / cooldown. Mohon tunggu beberapa saat atau tambahkan API Key Gemini lain.');
        }
        throw new Error(`Semua API Key Gemini Anda gagal digunakan: ${classified.reason}`);
      }
      throw new Error('Semua API Key Gemini Anda sedang tidak dapat digunakan (cooldown/invalid). Mohon masukkan API Key Gemini yang valid.');
    }

    const { key, maskedId } = selected;

    for (const modelCandidate of candidateModels) {
      try {
        const ai = new GoogleGenAI({
          apiKey: key,
          httpOptions: {
            headers: {
              'User-Agent': 'aistudio-build',
            },
          },
        });

        const result = await executor(ai, key, modelCandidate);
        markKeySuccess(key);

        return {
          data: result,
          modelUsed: modelCandidate,
          keyUsedMasked: maskedId,
        };
      } catch (err: any) {
        lastError = err;
        const classified = classifyGeminiError(err);

        console.warn(`[GeminiRunner] Visitor Key ${maskedId} model ${modelCandidate} failed: ${classified.reason}`);

        if (classified.type === 'PERMANENT') {
          markKeyInvalid(key, classified.reason);
          break; // Break model loop, failover to next visitor key
        } else {
          // Retryable error (429, 5xx, timeout, etc.)
          markKeyCooldown(key, classified.retryAfterMs, classified.reason);
          break; // Break model loop, failover to next visitor key
        }
      }
    }
  }
}
