/**
 * Helper to get or generate a unique Visitor Pool ID per browser session.
 * Stored in sessionStorage so that Round Robin cursors and Adaptive Cooldowns
 * are strictly isolated to the current user's session.
 */
export function getVisitorPoolId(): string {
  if (typeof window === 'undefined' || !window.sessionStorage) {
    return 'pool_transient_session';
  }

  const STORAGE_KEY = 'canvas_prd_visitor_pool_id';
  let poolId = window.sessionStorage.getItem(STORAGE_KEY);

  if (!poolId) {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
      poolId = `pool_${crypto.randomUUID()}`;
    } else {
      poolId = `pool_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
    }
    window.sessionStorage.setItem(STORAGE_KEY, poolId);
  }

  return poolId;
}

export function getVisitorRequestSequence(): number {
  if (typeof window === 'undefined' || !window.sessionStorage) {
    return 0;
  }
  const STORAGE_KEY = 'canvas_prd_visitor_request_sequence';
  const val = window.sessionStorage.getItem(STORAGE_KEY);
  const num = val ? parseInt(val, 10) : 0;
  return isNaN(num) || num < 0 ? 0 : num;
}

/**
 * Synchronously increments and returns the request sequence number before sending a request.
 */
export function incrementVisitorRequestSequence(): number {
  if (typeof window === 'undefined' || !window.sessionStorage) {
    return 0;
  }
  const STORAGE_KEY = 'canvas_prd_visitor_request_sequence';
  const current = getVisitorRequestSequence();
  const next = current + 1;
  window.sessionStorage.setItem(STORAGE_KEY, next.toString());
  return current;
}

export function resetVisitorRequestSequence(): void {
  if (typeof window === 'undefined' || !window.sessionStorage) {
    return;
  }
  const STORAGE_KEY = 'canvas_prd_visitor_request_sequence';
  window.sessionStorage.setItem(STORAGE_KEY, '0');
}
