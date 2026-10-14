/**
 * Safe, resilient browser storage abstraction.
 * Wraps localStorage with memory fallback and error recovery.
 */

export const STORAGE_KEYS = Object.freeze({
  FAVORITES: 'qod_favorites_v1'
});

/**
 * In-memory fallback map for environments where localStorage is unavailable,
 * disabled, or quota-exceeded.
 */
class MemoryStorage {
  constructor() {
    this.store = new Map();
  }
  getItem(key) {
    return this.store.has(key) ? this.store.get(key) : null;
  }
  setItem(key, value) {
    this.store.set(key, String(value));
  }
  removeItem(key) {
    this.store.delete(key);
  }
  clear() {
    this.store.clear();
  }
}

// Internal reference to currently active storage backend
let activeEngine = null;

/**
 * Detects whether native localStorage is operational.
 * @returns {Storage}
 */
export function getStorageEngine() {
  if (activeEngine !== null) {
    return activeEngine;
  }

  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const testKey = '__qod_storage_test__';
      window.localStorage.setItem(testKey, '1');
      window.localStorage.removeItem(testKey);
      activeEngine = window.localStorage;
      return activeEngine;
    }
  } catch (err) {
    console.warn('localStorage is unavailable or restricted. Falling back to in-memory storage.', err);
  }

  activeEngine = new MemoryStorage();
  return activeEngine;
}

/**
 * Override the storage engine (primarily used in automated tests).
 * @param {object|null} engine
 */
export function setStorageEngine(engine) {
  activeEngine = engine;
}

/**
 * Safely load and validate favorited quote IDs from persistent storage.
 * @returns {number[]} Array of unique, valid numeric quote IDs.
 */
export function loadFavorites() {
  const engine = getStorageEngine();
  try {
    const raw = engine.getItem(STORAGE_KEYS.FAVORITES);
    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      console.warn('Malformed favorites payload in storage; resetting to empty array.');
      return [];
    }

    // Validate that items are positive integer numbers
    const validIds = parsed
      .map(id => Number(id))
      .filter(num => Number.isInteger(num) && num > 0);

    // Return deduplicated array
    return Array.from(new Set(validIds));
  } catch (err) {
    console.warn('Failed to parse favorites from storage, resetting.', err);
    return [];
  }
}

/**
 * Persist an array or Set of quote IDs to storage.
 * @param {Iterable<number>} ids
 * @returns {boolean} True if successfully saved, false if an error occurred.
 */
export function saveFavorites(ids) {
  const engine = getStorageEngine();
  try {
    const array = Array.from(ids)
      .map(id => Number(id))
      .filter(num => Number.isInteger(num) && num > 0);

    const serialized = JSON.stringify(array);
    engine.setItem(STORAGE_KEYS.FAVORITES, serialized);
    return true;
  } catch (err) {
    console.error('Failed to save favorites to storage:', err);
    return false;
  }
}

/**
 * Clear all saved favorites from storage.
 * @returns {boolean}
 */
export function clearFavorites() {
  const engine = getStorageEngine();
  try {
    engine.removeItem(STORAGE_KEYS.FAVORITES);
    return true;
  } catch (err) {
    console.error('Failed to clear favorites from storage:', err);
    return false;
  }
}
