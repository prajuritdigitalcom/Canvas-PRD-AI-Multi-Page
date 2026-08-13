import express from 'express';
import { getVisitorKeysFromRequest, maskApiKey } from './visitorKeyParser.js';
import { classifyGeminiError } from './geminiErrorClassifier.js';
import { getKeyState, markKeyCooldown, markKeyInvalid, markKeySuccess } from './adaptiveCooldown.js';
import { VisitorKeyScheduler } from './visitorKeyScheduler.js';

export function testGeminiServices() {
  console.log('Running Gemini Services Unit Tests...');

  // 1. Test Key Masking & Parsing
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
  console.log('✓ Visitor Key Parser Test Passed');

  // 2. Test Error Classifier
  const err429 = classifyGeminiError({ status: 429, message: 'Resource exhausted' });
  if (err429.type !== 'RETRYABLE' || err429.statusCode !== 429) {
    throw new Error('Test Failed: 429 error not classified as RETRYABLE');
  }

  const err401 = classifyGeminiError({ status: 401, message: 'API_KEY_INVALID' });
  if (err401.type !== 'PERMANENT') {
    throw new Error('Test Failed: 401 error not classified as PERMANENT');
  }
  console.log('✓ Gemini Error Classifier Test Passed');

  // 3. Test Adaptive Cooldown
  const testKey = 'test_api_key_1';
  markKeyCooldown(testKey, 5000, 'Rate limit test');
  let state = getKeyState(testKey);
  if (state.status !== 'COOLDOWN') {
    throw new Error('Test Failed: Key state should be COOLDOWN after markKeyCooldown');
  }

  markKeySuccess(testKey);
  state = getKeyState(testKey);
  if (state.status !== 'READY') {
    throw new Error('Test Failed: Key state should be READY after markKeySuccess');
  }

  markKeyInvalid(testKey, 'Invalid key test');
  state = getKeyState(testKey);
  if (state.status !== 'INVALID') {
    throw new Error('Test Failed: Key state should be INVALID after markKeyInvalid');
  }
  console.log('✓ Adaptive Cooldown Test Passed');

  // 4. Test Round Robin Scheduler & Isolation
  const readyKey1 = 'visitor_key_ready_1';
  const readyKey2 = 'visitor_key_ready_2';
  markKeySuccess(readyKey1);
  markKeySuccess(readyKey2);

  const scheduler = new VisitorKeyScheduler([readyKey1, readyKey2]);
  const firstPick = scheduler.getNextEligibleKey();
  const secondPick = scheduler.getNextEligibleKey();
  const thirdPick = scheduler.getNextEligibleKey();

  if (!firstPick || !secondPick) {
    throw new Error('Test Failed: Scheduler failed to pick eligible keys');
  }
  if (thirdPick !== null) {
    throw new Error('Test Failed: Scheduler picked key more than 1 attempt per request cycle');
  }
  console.log('✓ Round Robin Scheduler Test Passed');

  console.log('ALL GEMINI SERVICES TESTS PASSED SUCCESSFULLY!');
}

if (typeof process !== 'undefined' && process.argv[1]?.includes('geminiServices.test')) {
  testGeminiServices();
}
