import express from 'express';
import { getVisitorKeysFromRequest, maskApiKey, getPoolFingerprint } from './visitorKeyParser.js';
import { classifyGeminiError } from './geminiErrorClassifier.js';
import { getKeyState, markKeyCooldown, markKeyInvalid, markKeySuccess } from './adaptiveCooldown.js';
import { VisitorKeyScheduler } from './visitorKeyScheduler.js';
import { runGeminiWithVisitorKeys } from './geminiRequestRunner.js';

export async function testGeminiServices() {
  console.log('Running Gemini Services Unit Tests...');

  // 1. Test Key Masking, Parsing & Fingerprinting
  const masked = maskApiKey('AIzaSy1234567890ABCD');
  if (masked !== '••••ABCD') {
    throw new Error(`Test Failed: maskApiKey expected ••••ABCD, got ${masked}`);
  }

  const mockReq = {
    headers: {
      'x-user-api-keys': JSON.stringify([' key1 ', 'key2', 'key1', '']),
    },
  } as unknown as express.Request;

  const parsedKeys = getVisitorKeysFromRequest(mockReq);
  if (parsedKeys.length !== 2 || parsedKeys[0] !== 'key1' || parsedKeys[1] !== 'key2') {
    throw new Error(`Test Failed: getVisitorKeysFromRequest output incorrect: ${JSON.stringify(parsedKeys)}`);
  }

  const fpA = getPoolFingerprint(['keyA', 'keyB']);
  const fpA2 = getPoolFingerprint(['keyB', 'keyA']);
  if (fpA !== fpA2) {
    throw new Error('Test Failed: getPoolFingerprint should be deterministic regardless of order');
  }
  console.log('✓ Visitor Key Parser & Fingerprint Test Passed');

  // 2. Test Error Classifier Categories
  const err429 = classifyGeminiError({ status: 429, message: 'Resource exhausted' });
  if (err429.type !== 'RETRYABLE' || err429.statusCode !== 429) {
    throw new Error('Test Failed: 429 error not classified as RETRYABLE');
  }

  const err401 = classifyGeminiError({ status: 401, message: 'API_KEY_INVALID' });
  if (err401.type !== 'PERMANENT') {
    throw new Error('Test Failed: 401 error not classified as PERMANENT');
  }

  const err400 = classifyGeminiError({ status: 400, message: 'invalid_argument: Prompt too long' });
  if (err400.type !== 'REQUEST_ERROR') {
    throw new Error('Test Failed: 400 error not classified as REQUEST_ERROR');
  }
  console.log('✓ Gemini Error Classifier Test Passed');

  // 3. Test Adaptive Cooldown & Visitor Pool Isolation
  const poolA = getPoolFingerprint(['shared_key_1', 'shared_key_2']);
  const poolB = getPoolFingerprint(['shared_key_1', 'different_key_3']);

  markKeyCooldown('shared_key_1', poolA, 5000, 'Rate limit in pool A');
  const statePoolA = getKeyState('shared_key_1', poolA);
  const statePoolB = getKeyState('shared_key_1', poolB);

  if (statePoolA.status !== 'COOLDOWN') {
    throw new Error('Test Failed: Key state should be COOLDOWN in Pool A');
  }
  if (statePoolB.status !== 'READY') {
    throw new Error('Test Failed: Key state in Pool B should remain READY (Visitor Isolation failed)');
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

  // 4. Test Round Robin Scheduler Per Visitor Pool Isolation
  const schedulerA = new VisitorKeyScheduler(['visA_key1', 'visA_key2']);
  const schedulerB = new VisitorKeyScheduler(['visB_key1', 'visB_key2']);

  const pickA1 = schedulerA.getNextEligibleKey();
  const pickB1 = schedulerB.getNextEligibleKey();
  const pickA2 = schedulerA.getNextEligibleKey();

  if (pickA1?.key !== 'visA_key1' || pickA2?.key !== 'visA_key2') {
    throw new Error(`Test Failed: Scheduler A did not cycle keys correctly. Got: ${pickA1?.key}, ${pickA2?.key}`);
  }
  if (pickB1?.key !== 'visB_key1') {
    throw new Error(`Test Failed: Scheduler B failed to pick visB_key1. Got: ${pickB1?.key}`);
  }

  const pickA3 = schedulerA.getNextEligibleKey();
  if (pickA3 !== null) {
    throw new Error('Test Failed: Scheduler should return null after attempting all candidate keys in request cycle');
  }
  console.log('✓ Round Robin Scheduler Per-Visitor Isolation Test Passed');

  // 5. Test Runner Failover & Bounded Execution
  let attempts = 0;
  const runnerResult = await runGeminiWithVisitorKeys<string>({
    keys: ['fail_key1', 'success_key2'],
    candidateModels: ['gemini-2.5-flash'],
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
