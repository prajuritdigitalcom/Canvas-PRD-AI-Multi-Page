import express from 'express';
import { createHash } from 'node:crypto';

/**
 * Computes a secure, non-reversible SHA-256 fingerprint for a key or string.
 */
export function hashKey(key: string): string {
  if (!key) return 'empty';
  return createHash('sha256').update(key.trim()).digest('hex').substring(0, 16);
}

/**
 * Generates a deterministic fingerprint for a list of visitor API keys.
 */
export function getPoolFingerprint(keys: string[]): string {
  if (!keys || keys.length === 0) return 'empty_pool';
  const sorted = Array.from(new Set(keys.map((k) => k.trim()).filter(Boolean))).sort();
  const rawJoined = sorted.join('|');
  const digest = createHash('sha256').update(rawJoined).digest('hex').substring(0, 16);
  return `pool_${digest}_${sorted.length}`;
}

/**
 * Validates visitorPoolId structure.
 */
export function isValidVisitorPoolId(id: any): boolean {
  if (typeof id !== 'string') return false;
  const trimmed = id.trim();
  if (trimmed.length === 0 || trimmed.length > 100) return false;
  return /^[a-zA-Z0-9_-]+$/.test(trimmed);
}

/**
 * Parses and extracts visitorPoolId from request body or header,
 * defaulting to the pool fingerprint of the visitor's API keys if not provided.
 */
export function getVisitorPoolIdFromRequest(req: express.Request, keys: string[]): string {
  const bodyPoolId = req.body?.visitorPoolId || req.body?.poolId;
  if (bodyPoolId && isValidVisitorPoolId(bodyPoolId)) {
    return bodyPoolId.trim();
  }

  const headerPoolId = req.headers['x-visitor-pool-id'] as string | undefined;
  if (headerPoolId && isValidVisitorPoolId(headerPoolId)) {
    return headerPoolId.trim();
  }

  return getPoolFingerprint(keys);
}

/**
 * Extracts sequence index from request body or header.
 */
export function getVisitorRequestSequenceFromRequest(req: express.Request): number | undefined {
  if (typeof req.body?.visitorRequestSequence === 'number') {
    return Math.max(0, req.body.visitorRequestSequence);
  }
  const headerSeq = req.headers['x-visitor-request-sequence'] as string | undefined;
  if (headerSeq) {
    const parsed = parseInt(headerSeq, 10);
    if (!isNaN(parsed) && parsed >= 0) {
      return parsed;
    }
  }
  return undefined;
}

/**
 * Parses and sanitizes Visitor API keys sent via request body or HTTP headers.
 * Primary: req.body.visitorApiKeys or req.body.visitorKeys
 * Fallback: x-user-api-keys or x-user-api-key headers
 * Strictly returns ONLY the visitor's provided API keys.
 */
export function getVisitorKeysFromRequest(req: express.Request): string[] {
  let parsed: string[] = [];

  // 1. Try reading from request body
  if (req.body) {
    const bodyKeys = req.body.visitorApiKeys || req.body.visitorKeys;
    if (Array.isArray(bodyKeys)) {
      parsed = bodyKeys.map((k) => (typeof k === 'string' ? k.trim() : '')).filter(Boolean);
    } else if (typeof bodyKeys === 'string') {
      parsed = bodyKeys.split(/[\n,]+/).map((k) => k.trim()).filter(Boolean);
    }
  }

  // 2. Fallback to HTTP headers if body was empty
  if (parsed.length === 0) {
    const headerKeys = req.headers['x-user-api-keys'] as string | undefined;
    const legacyHeader = req.headers['x-user-api-key'] as string | undefined;

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
