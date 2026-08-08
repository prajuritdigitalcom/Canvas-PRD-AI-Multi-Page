export const GEMINI_MODEL = process.env.GEMINI_MODEL_NAME || 'gemini-flash-latest';
export const STABLE_FALLBACK_MODEL = 'gemini-3.6-flash';

/**
 * Returns ordered array of model candidates:
 * 1. Primary model configured via env variable GEMINI_MODEL_NAME or default 'gemini-flash-latest'
 * 2. Fallback stable model 'gemini-3.6-flash'
 */
export function getModelFallbackChain(): string[] {
  const primary = process.env.GEMINI_MODEL_NAME || 'gemini-flash-latest';
  if (primary === STABLE_FALLBACK_MODEL) {
    return [primary];
  }
  return [primary, STABLE_FALLBACK_MODEL];
}
