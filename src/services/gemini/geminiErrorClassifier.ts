export type GeminiErrorType = 'PERMANENT' | 'RETRYABLE' | 'REQUEST_ERROR' | 'MODEL_ERROR' | 'UNKNOWN';

export interface ClassifiedError {
  type: GeminiErrorType;
  reason: string;
  statusCode?: number;
  retryAfterMs?: number | null;
}

/**
 * Classifies an error caught from Gemini API execution.
 */
export function classifyGeminiError(error: any): ClassifiedError {
  const msg = (error?.message || String(error || '')).toLowerCase();
  const status = error?.status || error?.statusCode || error?.response?.status;

  // Extract Retry-After if available in response headers or error body
  let retryAfterMs: number | null = null;
  const retryHeader = error?.response?.headers?.get?.('retry-after') || error?.headers?.['retry-after'];
  if (retryHeader) {
    const parsedSec = parseInt(retryHeader, 10);
    if (!isNaN(parsedSec) && parsedSec > 0) {
      retryAfterMs = parsedSec * 1000;
    }
  }

  // 1. Check for explicit Permanent API key errors (401, or 403 with explicit invalid key message)
  const isExplicitInvalidKeyMsg =
    msg.includes('api_key_invalid') ||
    msg.includes('api key not valid') ||
    msg.includes('invalid api key') ||
    msg.includes('api_key_not_found') ||
    msg.includes('unauthorized');

  if (status === 401 || (status === 403 && isExplicitInvalidKeyMsg) || isExplicitInvalidKeyMsg) {
    return {
      type: 'PERMANENT',
      reason: 'API Key tidak valid atau tidak memiliki akses.',
      statusCode: status || 401,
      retryAfterMs: null,
    };
  }

  // 2. Check for Model errors (HTTP 404 or model not found / model unavailable)
  const isModelError =
    status === 404 ||
    msg.includes('model not found') ||
    msg.includes('models/') ||
    msg.includes('is not found for api version');

  if (isModelError) {
    return {
      type: 'MODEL_ERROR',
      reason: 'Model AI tidak ditemukan atau tidak tersedia.',
      statusCode: 404,
      retryAfterMs: null,
    };
  }

  // 3. Check for Request errors (HTTP 400, bad prompt, malformed arguments)
  const isRequestError =
    status === 400 ||
    msg.includes('invalid_argument') ||
    msg.includes('invalid argument') ||
    msg.includes('bad request');

  if (isRequestError) {
    return {
      type: 'REQUEST_ERROR',
      reason: error?.message || 'Format request atau argumen tidak valid.',
      statusCode: 400,
      retryAfterMs: null,
    };
  }

  // 4. Check for Retryable / Failover errors (429 Rate Limit / Quota, 5xx Server Errors, Network Failures, generic 403)
  const isRateLimitOrQuota =
    status === 429 ||
    msg.includes('resource_exhausted') ||
    msg.includes('rate limit') ||
    msg.includes('quota') ||
    msg.includes('too many requests');

  const isServerErrorOrGeneric403 =
    status >= 500 ||
    status === 403 ||
    msg.includes('500') ||
    msg.includes('502') ||
    msg.includes('503') ||
    msg.includes('504') ||
    msg.includes('unavailable') ||
    msg.includes('overloaded') ||
    msg.includes('econnreset') ||
    msg.includes('etimedout') ||
    msg.includes('fetch failed') ||
    msg.includes('network');

  if (isRateLimitOrQuota || isServerErrorOrGeneric403) {
    return {
      type: 'RETRYABLE',
      reason: isRateLimitOrQuota
        ? 'Batas kuota/rate limit tercapai (429).'
        : 'Server Google sedang sibuk / kendala jaringan (5xx/403).',
      statusCode: status || (isRateLimitOrQuota ? 429 : 503),
      retryAfterMs,
    };
  }

  return {
    type: 'UNKNOWN',
    reason: error?.message || 'Terjadi kesalahan tidak terduga saat memanggil API Gemini.',
    statusCode: status || 500,
    retryAfterMs: null,
  };
}
