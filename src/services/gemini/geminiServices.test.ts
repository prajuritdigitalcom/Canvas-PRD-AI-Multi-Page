import express from 'express';
import { getVisitorKeysFromRequest, maskApiKey, getPoolFingerprint } from './visitorKeyParser.js';
import { classifyGeminiError } from './geminiErrorClassifier.js';
import { getKeyState, markKeyCooldown, markKeyInvalid, markKeySuccess, MAX_COOLDOWN_MS } from './adaptiveCooldown.js';
import { VisitorKeyScheduler } from './visitorKeyScheduler.js';
import { runGeminiWithVisitorKeys } from './geminiRequestRunner.js';

export async function testGeminiServices() {
  console.log('Running Gemini Services Unit Tests...');

  // 1. Test Key Masking, Parsing & Fingerprinting
  const masked = maskApiKey('AIzaSy1234567890ABCD');
  if (masked !== '••••ABCD') {
    throw new Error(`Test Failed: maskApiKey expected ••••ABCD, got ${masked}`);
  }

  // Test body parsing
  const mockReqBody = {
    body: {
      visitorApiKeys: [' key1 ', 'key2', 'key1', ''],
      visitorPoolId: 'pool_session_123',
    },
  } as unknown as express.Request;

  const parsedKeys = getVisitorKeysFromRequest(mockReqBody);
  if (parsedKeys.length !== 2 || parsedKeys[0] !== 'key1' || parsedKeys[1] !== 'key2') {
    throw new Error(`Test Failed: getVisitorKeysFromRequest body parsing incorrect: ${JSON.stringify(parsedKeys)}`);
  }

  const fpA = getPoolFingerprint(['keyA', 'keyB']);
  const fpA2 = getPoolFingerprint(['keyB', 'keyA']);
  if (fpA !== fpA2) {
    throw new Error('Test Failed: getPoolFingerprint should be deterministic regardless of order');
  }
  console.log('✓ Visitor Key Parser & Body Keys Test Passed');

  // 2. Test Error Classifier Categories
  const err429 = classifyGeminiError({ status: 429, message: 'Resource exhausted' });
  if (err429.type !== 'RETRYABLE' || err429.statusCode !== 429) {
    throw new Error('Test Failed: 429 error not classified as RETRYABLE');
  }

  const err401 = classifyGeminiError({ status: 401, message: 'API_KEY_INVALID' });
  if (err401.type !== 'PERMANENT') {
    throw new Error('Test Failed: 401 error not classified as PERMANENT');
  }

  const err404 = classifyGeminiError({ status: 404, message: 'models/gemini-legacy is not found' });
  if (err404.type !== 'MODEL_ERROR') {
    throw new Error('Test Failed: 404 error not classified as MODEL_ERROR');
  }

  const err400 = classifyGeminiError({ status: 400, message: 'invalid_argument: Prompt too long' });
  if (err400.type !== 'REQUEST_ERROR') {
    throw new Error('Test Failed: 400 error not classified as REQUEST_ERROR');
  }
  console.log('✓ Gemini Error Classifier Test Passed');

  // 3. Test Adaptive Cooldown, Max Cap & Visitor Pool Isolation
  const poolA = 'session_visitor_A';
  const poolB = 'session_visitor_B';

  markKeyCooldown('shared_key_1', poolA, 5000, 'Rate limit in pool A');
  const statePoolA = getKeyState('shared_key_1', poolA);
  const statePoolB = getKeyState('shared_key_1', poolB);

  if (statePoolA.status !== 'COOLDOWN') {
    throw new Error('Test Failed: Key state should be COOLDOWN in Pool A');
  }
  if (statePoolB.status !== 'READY') {
    throw new Error('Test Failed: Key state in Pool B should remain READY (Visitor Isolation failed)');
  }

  // Test Retry-After Cap
  const now = Date.now();
  markKeyCooldown('shared_key_capped', poolA, 3600000, 'Long Retry-After');
  const stateCapped = getKeyState('shared_key_capped', poolA);
  if (stateCapped.cooldownUntil - now > MAX_COOLDOWN_MS + 1000) {
    throw new Error(`Test Failed: Cooldown until should be capped at ${MAX_COOLDOWN_MS}ms`);
  }

  markKeySuccess('shared_key_1', poolA);
  if (getKeyState('shared_key_1', poolA).status !== 'READY') {
    throw new Error('Test Failed: Key state should be READY after markKeySuccess');
  }

  markKeyInvalid('shared_key_1', poolA, 'Invalid key test');
  if (getKeyState('shared_key_1', poolA).status !== 'INVALID') {
    throw new Error('Test Failed: Key state should be INVALID after markKeyInvalid');
  }
  console.log('✓ Adaptive Cooldown & Visitor Isolation Test Passed');

  // 4. Test Round Robin Scheduler Across Multiple Requests
  const poolSessionId = 'pool_test_rr_1';
  const keysPool = ['key1', 'key2', 'key3'];

  // Request 1
  const sched1 = new VisitorKeyScheduler(keysPool, poolSessionId);
  const req1Key = sched1.getNextEligibleKey()?.key;

  // Request 2
  const sched2 = new VisitorKeyScheduler(keysPool, poolSessionId);
  const req2Key = sched2.getNextEligibleKey()?.key;

  // Request 3
  const sched3 = new VisitorKeyScheduler(keysPool, poolSessionId);
  const req3Key = sched3.getNextEligibleKey()?.key;

  // Request 4
  const sched4 = new VisitorKeyScheduler(keysPool, poolSessionId);
  const req4Key = sched4.getNextEligibleKey()?.key;

  if (req1Key !== 'key1' || req2Key !== 'key2' || req3Key !== 'key3' || req4Key !== 'key1') {
    throw new Error(`Test Failed: Round Robin across requests failed. Expected key1->key2->key3->key1, got ${req1Key}->${req2Key}->${req3Key}->${req4Key}`);
  }
  console.log('✓ Round Robin Across Requests Test Passed');

  // 5. Test Round Robin When Key 1 Is In Cooldown (Fair Rotation between K2 and K3)
  const poolSessionIdCooldown = 'pool_test_rr_cooldown_1';
  const keysPoolCooldown = ['ckey1', 'ckey2', 'ckey3'];
  markKeyCooldown('ckey1', poolSessionIdCooldown, 60000, 'K1 Cooldown Test');

  // Request 1: K1 is in cooldown -> K2 chosen
  const csched1 = new VisitorKeyScheduler(keysPoolCooldown, poolSessionIdCooldown);
  const creq1Key = csched1.getNextEligibleKey()?.key;

  // Request 2: K2 was chosen, so next choice MUST be K3 (not K2 again!)
  const csched2 = new VisitorKeyScheduler(keysPoolCooldown, poolSessionIdCooldown);
  const creq2Key = csched2.getNextEligibleKey()?.key;

  // Request 3: K3 was chosen, K1 is in cooldown -> next choice MUST be K2
  const csched3 = new VisitorKeyScheduler(keysPoolCooldown, poolSessionIdCooldown);
  const creq3Key = csched3.getNextEligibleKey()?.key;

  if (creq1Key !== 'ckey2' || creq2Key !== 'ckey3' || creq3Key !== 'ckey2') {
    throw new Error(`Test Failed: Round Robin during cooldown failed. Expected ckey2->ckey3->ckey2, got ${creq1Key}->${creq2Key}->${creq3Key}`);
  }
  console.log('✓ Round Robin During Cooldown (Fair Rotation) Test Passed');

  // 6. Test Runner Failover & Bounded Execution
  let attempts = 0;
  const runnerResult = await runGeminiWithVisitorKeys<string>({
    keys: ['fail_key1', 'success_key2'],
    candidateModels: ['gemini-2.5-flash'],
    visitorPoolId: 'runner_test_pool',
    executor: async (ai, apiKey, model) => {
      attempts++;
      if (apiKey === 'fail_key1') {
        throw { status: 429, message: 'Resource exhausted 429' };
      }
      return 'SUCCESS_DATA';
    },
  });

  if (runnerResult.data !== 'SUCCESS_DATA') {
    throw new Error('Test Failed: Runner failed to return SUCCESS_DATA from second key');
  }
  if (attempts !== 2) {
    throw new Error(`Test Failed: Expected 2 attempts in failover, got ${attempts}`);
  }
  console.log('✓ Gemini Request Runner Failover Test Passed');

  console.log('ALL GEMINI SERVICES TESTS PASSED SUCCESSFULLY!');
}

if (typeof process !== 'undefined' && process.argv[1]?.includes('geminiServices.test')) {
  testGeminiServices().catch((err) => {
    console.error('Test Execution Failed:', err);
    process.exit(1);
  });
}
