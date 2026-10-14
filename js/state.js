/**
 * Reactive Application State Store
 * Manages the active quote, favorites set, persistence coordination,
 * and observer notifications.
 */

import { getRandomQuote, getQuoteById, getQuoteOfTheDay, getAllQuotes } from './quotes.js';
import { loadFavorites, saveFavorites } from './storage.js';

class StateStore {
  constructor() {
    this.currentQuote = null;
    this.favoriteIds = new Set();
    this.history = [];
    this.listeners = new Set();
    this.initialized = false;
  }

  /**
   * Initialize state from storage and set starting quote.
   * @param {object} [options]
   * @param {number} [options.initialQuoteId]
   * @param {Date} [options.date]
   */
  init(options = {}) {
    const storedIds = loadFavorites();
    this.favoriteIds = new Set(storedIds);

    if (options.initialQuoteId) {
      const q = getQuoteById(options.initialQuoteId);
      this.currentQuote = q || getQuoteOfTheDay(options.date);
    } else {
      this.currentQuote = getQuoteOfTheDay(options.date);
    }

    if (this.currentQuote) {
      this.history = [this.currentQuote.id];
    }

    this.initialized = true;
    this.notify();
    return this.getState();
  }

  /**
   * Returns a clean, immutable snapshot of the current state.
   */
  getState() {
    return {
      currentQuote: this.currentQuote ? { ...this.currentQuote } : null,
      isCurrentFavorited: this.currentQuote ? this.favoriteIds.has(this.currentQuote.id) : false,
      favoriteIds: Array.from(this.favoriteIds),
      favoritesCount: this.favoriteIds.size,
      favorites: this.getFavorites(),
      history: [...this.history]
    };
  }

  /**
   * Subscribe a listener function to state changes.
   * @param {Function} listener
   * @returns {Function} unsubscribe function
   */
  subscribe(listener) {
    if (typeof listener !== 'function') {
      throw new TypeError('Subscriber must be a function');
    }
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * Notify all registered subscribers with current state snapshot.
   */
  notify() {
    const snapshot = this.getState();
    for (const listener of this.listeners) {
      try {
        listener(snapshot);
      } catch (err) {
        console.error('Error in state subscriber:', err);
      }
    }
  }

  /**
   * Advance to a new random quote, ensuring it does not repeat the current quote.
   * @returns {object} The new current quote
   */
  nextQuote() {
    const excludeId = this.currentQuote ? this.currentQuote.id : null;
    const next = getRandomQuote(excludeId);
    this.currentQuote = next;

    if (next) {
      this.history.push(next.id);
      if (this.history.length > 50) {
        this.history.shift();
      }
    }

    this.notify();
    return this.currentQuote;
  }

  /**
   * Set a specific quote as active (e.g. selected from favorites drawer).
   * @param {number|string} id
   * @returns {boolean} True if quote was found and activated.
   */
  setCurrentQuote(id) {
    const quote = getQuoteById(id);
    if (!quote) {
      return false;
    }
    this.currentQuote = quote;
    this.history.push(quote.id);
    this.notify();
    return true;
  }

  /**
   * Toggle favorite state for a given quote ID (or active quote).
   * Persists changes to storage.
   * @param {number|string} [id]
   * @returns {boolean} New favorited state (true = favorited, false = unfavorited)
   */
  toggleFavorite(id = this.currentQuote?.id) {
    if (id === undefined || id === null) {
      return false;
    }

    const numericId = Number(id);
    const quote = getQuoteById(numericId);
    if (!quote) {
      return false;
    }

    let isNowFavorited = false;
    if (this.favoriteIds.has(numericId)) {
      this.favoriteIds.delete(numericId);
      isNowFavorited = false;
    } else {
      this.favoriteIds.add(numericId);
      isNowFavorited = true;
    }

    saveFavorites(this.favoriteIds);
    this.notify();
    return isNowFavorited;
  }

  /**
   * Explicitly remove a quote from favorites.
   * @param {number|string} id
   * @returns {boolean} True if removed, false if not found
   */
  removeFavorite(id) {
    const numericId = Number(id);
    if (!this.favoriteIds.has(numericId)) {
      return false;
    }

    this.favoriteIds.delete(numericId);
    saveFavorites(this.favoriteIds);
    this.notify();
    return true;
  }

  /**
   * Check if a specific quote is favorited.
   * @param {number|string} [id]
   * @returns {boolean}
   */
  isFavorite(id = this.currentQuote?.id) {
    if (id === undefined || id === null) return false;
    return this.favoriteIds.has(Number(id));
  }

  /**
   * Retrieve full quote objects for all favorited quotes.
   * @returns {object[]}
   */
  getFavorites() {
    const result = [];
    for (const id of this.favoriteIds) {
      const q = getQuoteById(id);
      if (q) {
        result.push({ ...q });
      }
    }
    return result;
  }

  /**
   * Reset state to defaults (useful for testing).
   */
  reset() {
    this.currentQuote = null;
    this.favoriteIds.clear();
    this.history = [];
    this.listeners.clear();
    this.initialized = false;
  }
}

// Singleton state store instance
export const store = new StateStore();
