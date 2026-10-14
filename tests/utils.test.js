import test from 'node:test';
import assert from 'node:assert/strict';
import { copyToClipboard } from '../js/utils.js';

test('Utils - copyToClipboard handles empty input gracefully', async () => {
  const result = await copyToClipboard('');
  assert.equal(result, false);

  const nullResult = await copyToClipboard(null);
  assert.equal(nullResult, false);
});
