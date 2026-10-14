import test from 'node:test';
import assert from 'node:assert/strict';
import {
  QUOTES,
  getAllQuotes,
  getQuoteById,
  getRandomQuote,
  getQuoteOfTheDay
} from '../js/quotes.js';

test('Quote Catalog - integrity and completeness', () => {
  assert.ok(Array.isArray(QUOTES), 'QUOTES should be an array');
  assert.ok(QUOTES.length >= 25, 'Catalog should contain at least 25 quotes');

  const seenIds = new Set();
  for (const quote of QUOTES) {
    assert.ok(typeof quote.id === 'number', `Quote id ${quote.id} must be a number`);
    assert.ok(!seenIds.has(quote.id), `Duplicate quote ID found: ${quote.id}`);
    seenIds.add(quote.id);

    assert.ok(typeof quote.text === 'string' && quote.text.trim().length > 0, `Quote ${quote.id} must have non-empty text`);
    assert.ok(typeof quote.author === 'string' && quote.author.trim().length > 0, `Quote ${quote.id} must have non-empty author`);
    assert.ok(typeof quote.category === 'string' && quote.category.trim().length > 0, `Quote ${quote.id} must have non-empty category`);
  }
});

test('getAllQuotes - returns complete frozen list', () => {
  const all = getAllQuotes();
  assert.equal(all.length, QUOTES.length);
  assert.throws(() => {
    // Attempt mutation
    all.push({ id: 999, text: 'Test', author: 'Test' });
  });
});

test('getQuoteById - finds valid quote and handles invalid id', () => {
  const q1 = getQuoteById(1);
  assert.ok(q1);
  assert.equal(q1.id, 1);
  assert.equal(q1.author, 'Marcus Aurelius');

  // String ID conversion
  const q1FromString = getQuoteById('1');
  assert.ok(q1FromString);
  assert.equal(q1FromString.id, 1);

  // Non-existent ID
  const notFound = getQuoteById(99999);
  assert.equal(notFound, undefined);
});

test('getRandomQuote - avoids repeating the excluded ID', () => {
  const excludeId = 1;
  for (let i = 0; i < 50; i++) {
    const random = getRandomQuote(excludeId);
    assert.ok(random, 'Should return a valid quote');
    assert.notEqual(random.id, excludeId, 'Selected quote must not match the excluded ID');
  }
});

test('getQuoteOfTheDay - is deterministic for a given date', () => {
  const dateA = new Date(2026, 9, 14); // Oct 14, 2026
  const qA1 = getQuoteOfTheDay(dateA);
  const qA2 = getQuoteOfTheDay(dateA);
  assert.equal(qA1.id, qA2.id, 'Same date must return identical quote');

  const dateB = new Date(2026, 9, 15); // Oct 15, 2026
  const qB = getQuoteOfTheDay(dateB);
  assert.ok(qB.id, 'Should return a valid quote for date B');
});
