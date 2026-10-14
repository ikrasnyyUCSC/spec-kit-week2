import test from 'node:test';
import assert from 'node:assert/strict';
import { store } from '../js/state.js';
import { setStorageEngine } from '../js/storage.js';

class MockStorage {
  constructor(initial = {}) {
    this.map = new Map(Object.entries(initial));
  }
  getItem(key) {
    return this.map.has(key) ? this.map.get(key) : null;
  }
  setItem(key, value) {
    this.map.set(key, String(value));
  }
  removeItem(key) {
    this.map.delete(key);
  }
  clear() {
    this.map.clear();
  }
}

test('State Store - initializes with quote and loads stored favorites', () => {
  store.reset();
  const mock = new MockStorage({
    'qod_favorites_v1': JSON.stringify([2, 5])
  });
  setStorageEngine(mock);

  const state = store.init({ initialQuoteId: 1 });
  assert.ok(state.currentQuote, 'Must have a current quote');
  assert.equal(state.currentQuote.id, 1);
  assert.equal(state.favoritesCount, 2);
  assert.deepEqual(state.favoriteIds.sort(), [2, 5]);
  assert.equal(state.isCurrentFavorited, false);
});

test('State Store - nextQuote changes quote without immediate repeat', () => {
  store.reset();
  setStorageEngine(new MockStorage());
  store.init({ initialQuoteId: 1 });

  for (let i = 0; i < 20; i++) {
    const prevId = store.getState().currentQuote.id;
    const next = store.nextQuote();
    assert.ok(next);
    assert.notEqual(next.id, prevId, `Cycle ${i}: Next quote must differ from previous`);
  }
});

test('State Store - toggleFavorite adds, removes and updates storage', () => {
  store.reset();
  const mock = new MockStorage();
  setStorageEngine(mock);
  store.init({ initialQuoteId: 1 });

  assert.equal(store.isFavorite(1), false);

  // Toggle ON
  const result1 = store.toggleFavorite(1);
  assert.equal(result1, true);
  assert.equal(store.isFavorite(1), true);
  assert.equal(store.getState().favoritesCount, 1);
  assert.equal(mock.getItem('qod_favorites_v1'), JSON.stringify([1]));

  // Toggle OFF
  const result2 = store.toggleFavorite(1);
  assert.equal(result2, false);
  assert.equal(store.isFavorite(1), false);
  assert.equal(store.getState().favoritesCount, 0);
  assert.equal(mock.getItem('qod_favorites_v1'), JSON.stringify([]));
});

test('State Store - removeFavorite removes specific ID', () => {
  store.reset();
  const mock = new MockStorage({
    'qod_favorites_v1': JSON.stringify([3, 4])
  });
  setStorageEngine(mock);
  store.init({ initialQuoteId: 3 });

  assert.equal(store.getState().favoritesCount, 2);
  const removed = store.removeFavorite(4);
  assert.equal(removed, true);
  assert.equal(store.getState().favoritesCount, 1);
  assert.equal(store.isFavorite(4), false);
  assert.equal(store.isFavorite(3), true);

  // Removing non-existent returns false
  assert.equal(store.removeFavorite(9999), false);
});

test('State Store - setCurrentQuote switches the active quote', () => {
  store.reset();
  setStorageEngine(new MockStorage());
  store.init({ initialQuoteId: 1 });

  const switched = store.setCurrentQuote(7);
  assert.equal(switched, true);
  assert.equal(store.getState().currentQuote.id, 7);
  assert.equal(store.getState().currentQuote.author, 'Nelson Mandela');

  // Non-existent quote
  const invalid = store.setCurrentQuote(99999);
  assert.equal(invalid, false);
});

test('State Store - subscriber lifecycle and notifications', () => {
  store.reset();
  setStorageEngine(new MockStorage());

  let callCount = 0;
  let lastSnapshot = null;
  const unsubscribe = store.subscribe(snapshot => {
    callCount++;
    lastSnapshot = snapshot;
  });

  store.init({ initialQuoteId: 2 });
  assert.equal(callCount, 1);
  assert.equal(lastSnapshot.currentQuote.id, 2);

  store.toggleFavorite(2);
  assert.equal(callCount, 2);
  assert.equal(lastSnapshot.isCurrentFavorited, true);

  unsubscribe();
  store.nextQuote();
  // Call count should NOT increase after unsubscribe
  assert.equal(callCount, 2);
});
