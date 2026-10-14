import test from 'node:test';
import assert from 'node:assert/strict';
import {
  STORAGE_KEYS,
  loadFavorites,
  saveFavorites,
  clearFavorites,
  setStorageEngine,
  getStorageEngine
} from '../js/storage.js';

class MockStorage {
  constructor() {
    this.map = new Map();
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

test('Storage - defaults to empty array on fresh launch', () => {
  const mock = new MockStorage();
  setStorageEngine(mock);

  const loaded = loadFavorites();
  assert.deepEqual(loaded, []);
});

test('Storage - saves and loads favorites cleanly', () => {
  const mock = new MockStorage();
  setStorageEngine(mock);

  const testIds = [1, 5, 12];
  const ok = saveFavorites(testIds);
  assert.equal(ok, true);

  const loaded = loadFavorites();
  assert.deepEqual(loaded, [1, 5, 12]);
});

test('Storage - deduplicates and cleans invalid numbers', () => {
  const mock = new MockStorage();
  setStorageEngine(mock);

  saveFavorites([1, 1, 2, '3', 'invalid', -4, 0]);
  const loaded = loadFavorites();
  assert.deepEqual(loaded, [1, 2, 3]);
});

test('Storage - gracefully recovers from corrupt JSON in storage', () => {
  const mock = new MockStorage();
  setStorageEngine(mock);

  // Put corrupt non-JSON in storage
  mock.setItem(STORAGE_KEYS.FAVORITES, '{{corrupt-json--');
  const loaded = loadFavorites();
  assert.deepEqual(loaded, [], 'Corrupt storage should safely return empty array');

  // Put an object instead of array
  mock.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify({ notAnArray: true }));
  const loadedObj = loadFavorites();
  assert.deepEqual(loadedObj, [], 'Object instead of array should safely return empty array');
});

test('Storage - clearFavorites removes the key', () => {
  const mock = new MockStorage();
  setStorageEngine(mock);

  saveFavorites([1, 2, 3]);
  assert.deepEqual(loadFavorites(), [1, 2, 3]);

  clearFavorites();
  assert.deepEqual(loadFavorites(), []);
  assert.equal(mock.getItem(STORAGE_KEYS.FAVORITES), null);
});

test('Storage - handles storage throwing errors gracefully', () => {
  const failingStorage = {
    getItem() {
      throw new Error('Quota or security error');
    },
    setItem() {
      throw new Error('QuotaExceededError');
    },
    removeItem() {
      throw new Error('SecurityError');
    }
  };
  setStorageEngine(failingStorage);

  assert.doesNotThrow(() => {
    const loaded = loadFavorites();
    assert.deepEqual(loaded, []);
  });

  assert.doesNotThrow(() => {
    const saved = saveFavorites([1]);
    assert.equal(saved, false);
  });

  assert.doesNotThrow(() => {
    const cleared = clearFavorites();
    assert.equal(cleared, false);
  });
});
