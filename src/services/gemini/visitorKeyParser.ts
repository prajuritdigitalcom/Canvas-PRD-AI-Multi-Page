import express from 'express';

/**
 * Parses and sanitizes Visitor API keys sent via HTTP headers (x-user-api-keys or x-user-api-key).
 * Strictly returns ONLY the visitor's provided API keys.
 * NO server environment variables or backup keys are included.
 */
export function getVisitorKeysFromRequest(req: express.Request): string[] {
  const headerKeys = req.headers['x-user-api-keys'] as string | undefined;
  const legacyHeader = req.headers['x-user-api-key'] as string | undefined;

  let parsed: string[] = [];

  if (headerKeys) {
    try {
      const json = JSON.parse(headerKeys);
      if (Array.isArray(json)) {
        parsed = json.map((k) => (typeof k === 'string' ? k.trim() : '')).filter(Boolean);
      }
    } catch {
      if (typeof headerKeys === 'string') {
        parsed = headerKeys
          .split(/[\n,]+/)
          .map((k) => k.trim())
          .filter(Boolean);
      }
    }
  }

  if (parsed.length === 0 && legacyHeader) {
    parsed = legacyHeader
      .split(/[\n,]+/)
      .map((k) => k.trim())
      .filter(Boolean);
  }

  // Sanitize: trim, deduplicate, filter empty
  const uniqueKeys = Array.from(new Set(parsed.filter(Boolean)));
  // Limit max candidate keys to 20 per request payload
  return uniqueKeys.slice(0, 20);
}

/**
 * Mask raw API key for safe display and logging.
 * e.g., "AIzaSyABC123XYZ" -> "••••XYZ"
 */
export function maskApiKey(key: string): string {
  if (!key) return '••••';
  const trimmed = key.trim();
  if (trimmed.length <= 8) return '••••••••';
  return `••••${trimmed.slice(-4)}`;
}
