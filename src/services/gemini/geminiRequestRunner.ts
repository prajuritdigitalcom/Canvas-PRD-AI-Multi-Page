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
    throw new Error('Tidak ada API Key yang tersedia. Masukkan API Key Gemini Anda di menu Gemini API Key.');
  }

  const scheduler = new VisitorKeyScheduler(keys);
  const poolFingerprint = scheduler.getPoolFingerprint();
  const maxAttempts = scheduler.getCandidateCount();
  let lastError: any = null;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const selected = scheduler.getNextEligibleKey();

    if (!selected) {
      break;
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
        markKeySuccess(key, poolFingerprint);

        return {
          data: result,
          modelUsed: modelCandidate,
          keyUsedMasked: maskedId,
        };
      } catch (err: any) {
        lastError = err;
        const classified = classifyGeminiError(err);

        console.warn(`[GeminiRunner] Visitor Key ${maskedId} model ${modelCandidate} failed (${classified.type}): ${classified.reason}`);

        if (classified.type === 'REQUEST_ERROR') {
          // Bad request (HTTP 400). Do not blame API key or failover endlessly.
          throw new Error(`Permintaan tidak valid: ${classified.reason}`);
        } else if (classified.type === 'PERMANENT') {
          markKeyInvalid(key, poolFingerprint, classified.reason);
          break; // Failover to next candidate key in this pool
        } else if (classified.type === 'RETRYABLE') {
          markKeyCooldown(key, poolFingerprint, classified.retryAfterMs, classified.reason);
          break; // Failover to next candidate key in this pool
        } else {
          // UNKNOWN error
          throw new Error(`Gagal memanggil Gemini API: ${classified.reason}`);
        }
      }
    }
  }

  // All keys in the pool attempted or in cooldown/invalid
  if (lastError) {
    const classified = classifyGeminiError(lastError);
    if (classified.statusCode === 429) {
      throw new Error('Semua API Key Gemini Anda sedang mengalami rate limit / cooldown. Mohon tunggu beberapa saat atau tambahkan API Key Gemini lain.');
    }
    throw new Error(`Semua API Key Gemini Anda tidak dapat digunakan: ${classified.reason}`);
  }

  throw new Error('Semua API Key Gemini Anda sedang dalam masa cooldown atau tidak valid. Mohon periksa kembali API Key Anda.');
}
