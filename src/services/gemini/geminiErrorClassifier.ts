export type GeminiErrorType = 'RETRYABLE' | 'PERMANENT';

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

  // Check for Permanent errors (Invalid API key, Unauthorized, Forbidden key configuration, Malformed input)
  const isPermanent =
    status === 401 ||
    status === 403 ||
    msg.includes('api_key_invalid') ||
    msg.includes('api key not valid') ||
    msg.includes('invalid api key') ||
    msg.includes('unauthorized') ||
    msg.includes('forbidden') ||
    msg.includes('invalid_argument');

  if (isPermanent) {
    return {
      type: 'PERMANENT',
      reason: 'API Key tidak valid atau tidak memiliki akses.',
      statusCode: status || 401,
      retryAfterMs: null,
    };
  }

  // Check for Retryable / Failover errors (429 Rate Limit / Quota, 5xx Server Errors, Network Failures)
  const isRateLimitOrQuota =
    status === 429 ||
    msg.includes('resource_exhausted') ||
    msg.includes('rate limit') ||
    msg.includes('quota') ||
    msg.includes('too many requests');

  const isServerError =
    status >= 500 ||
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

  if (isRateLimitOrQuota || isServerError) {
    return {
      type: 'RETRYABLE',
      reason: isRateLimitOrQuota
        ? 'Batas kuota/rate limit tercapai (429).'
        : 'Server Google sedang sibuk / kendala jaringan.',
      statusCode: status || (isRateLimitOrQuota ? 429 : 503),
      retryAfterMs,
    };
  }

  // Default fallback: treat as retryable to allow failover to another key if available
  return {
    type: 'RETRYABLE',
    reason: error?.message || 'Terjadi kesalahan saat memanggil API Gemini.',
    statusCode: status || 500,
    retryAfterMs: null,
  };
}
