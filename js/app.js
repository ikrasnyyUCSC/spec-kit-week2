/**
 * Application Entry Point & Controller
 * Orchestrates DOM events, animations, state subscriptions, and user actions.
 */

import { store } from './state.js';
import { copyToClipboard, shareQuote, showToast } from './utils.js';

// DOM Element References
const dom = {
  quoteCard: document.getElementById('quote-card'),
  quoteText: document.getElementById('quote-text'),
  quoteAuthor: document.getElementById('quote-author'),
  quoteCategory: document.getElementById('quote-category'),
  favoriteBtn: document.getElementById('favorite-btn'),
  copyBtn: document.getElementById('copy-btn'),
  shareBtn: document.getElementById('share-btn'),
  newQuoteBtn: document.getElementById('new-quote-btn'),
  favoritesBadge: document.getElementById('favorites-badge'),
  viewFavoritesBtn: document.getElementById('view-favorites-btn'),
  favoritesDrawer: document.getElementById('favorites-drawer'),
  drawerBackdrop: document.getElementById('drawer-backdrop'),
  closeDrawerBtn: document.getElementById('close-drawer-btn'),
  favoritesList: document.getElementById('favorites-list'),
  drawerCountBadge: document.getElementById('drawer-count-badge')
};

// Track previous quote ID to animate only on actual changes
let lastRenderedQuoteId = null;

/**
 * Render the main quote display with transition animations.
 * @param {object} quote
 */
function renderQuote(quote) {
  if (!quote) return;

  if (lastRenderedQuoteId === quote.id) {
    // Only text content refresh without full fade
    dom.quoteText.textContent = `“${quote.text}”`;
    dom.quoteAuthor.textContent = quote.author;
    dom.quoteCategory.textContent = quote.category;
    return;
  }

  // Smooth fade transition
  dom.quoteText.classList.add('quote-fade-out');

  setTimeout(() => {
    dom.quoteText.textContent = `“${quote.text}”`;
    dom.quoteAuthor.textContent = quote.author;
    dom.quoteCategory.textContent = quote.category;

    dom.quoteText.classList.remove('quote-fade-out');
    dom.quoteText.classList.add('quote-fade-in');

    lastRenderedQuoteId = quote.id;

    setTimeout(() => {
      dom.quoteText.classList.remove('quote-fade-in');
    }, 250);
  }, 150);
}

/**
 * Render the favorites drawer content.
 * @param {object[]} favorites
 */
function renderFavoritesList(favorites) {
  dom.favoritesList.innerHTML = '';

  if (favorites.length === 0) {
    dom.favoritesList.innerHTML = `
      <div class="empty-favorites">
        <svg class="empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
        </svg>
        <p class="empty-text"><strong>No favorites saved yet.</strong></p>
        <p class="empty-text" style="font-size: 0.85rem;">Click the heart icon on any quote or press <kbd>F</kbd> to save quotes you love!</p>
      </div>
    `;
    return;
  }

  favorites.forEach(quote => {
    const item = document.createElement('div');
    item.className = 'fav-item';
    item.setAttribute('role', 'button');
    item.setAttribute('tabindex', '0');
    item.setAttribute('aria-label', `Select quote by ${quote.author}: ${quote.text}`);

    item.innerHTML = `
      <p class="fav-item-text">“${quote.text}”</p>
      <div class="fav-item-footer">
        <span class="fav-item-author">— ${quote.author}</span>
        <button class="btn-remove-fav" data-id="${quote.id}" aria-label="Remove quote from favorites" title="Remove">
          <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>
    `;

    // Click item body to activate quote
    item.addEventListener('click', (e) => {
      // Ignore if user clicked the remove button
      if (e.target.closest('.btn-remove-fav')) return;
      store.setCurrentQuote(quote.id);
      closeDrawer();
      showToast(`Showing quote by ${quote.author}`);
    });

    item.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        if (!e.target.closest('.btn-remove-fav')) {
          e.preventDefault();
          store.setCurrentQuote(quote.id);
          closeDrawer();
        }
      }
    });

    // Remove favorite button handler
    const removeBtn = item.querySelector('.btn-remove-fav');
    removeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      store.removeFavorite(quote.id);
      showToast('Removed from favorites');
    });

    dom.favoritesList.appendChild(item);
  });
}

/**
 * Synchronize UI elements with state snapshot.
 * @param {object} state
 */
function onStateChange(state) {
  renderQuote(state.currentQuote);

  // Update Favorite toggle button state
  dom.favoriteBtn.setAttribute('aria-pressed', state.isCurrentFavorited ? 'true' : 'false');
  dom.favoriteBtn.title = state.isCurrentFavorited
    ? 'Remove from favorites (Press F)'
    : 'Favorite (Press F)';
  dom.favoriteBtn.setAttribute(
    'aria-label',
    state.isCurrentFavorited ? 'Remove quote from favorites' : 'Add quote to favorites'
  );

  // Update Badges
  dom.favoritesBadge.textContent = state.favoritesCount;
  dom.favoritesBadge.setAttribute('aria-label', `${state.favoritesCount} saved quotes`);
  dom.drawerCountBadge.textContent = state.favoritesCount;

  // Refresh drawer items
  renderFavoritesList(state.favorites);
}

/**
 * Open Favorites Drawer with backdrop and accessibility attributes.
 */
function openDrawer() {
  dom.favoritesDrawer.classList.add('open');
  dom.drawerBackdrop.classList.add('active');
  dom.favoritesDrawer.setAttribute('aria-hidden', 'false');
  dom.closeDrawerBtn.focus();
}

/**
 * Close Favorites Drawer.
 */
function closeDrawer() {
  dom.favoritesDrawer.classList.remove('open');
  dom.drawerBackdrop.classList.remove('active');
  dom.favoritesDrawer.setAttribute('aria-hidden', 'true');
  dom.viewFavoritesBtn.focus();
}

/**
 * Spin the refresh icon momentarily when a new quote is fetched.
 */
function triggerSpinAnimation() {
  const icon = dom.newQuoteBtn.querySelector('.icon');
  if (icon) {
    icon.classList.remove('spin-once');
    // Force reflow
    void icon.offsetWidth;
    icon.classList.add('spin-once');
  }
}

/**
 * Initialize event listeners.
 */
function setupEventListeners() {
  // New Quote Action
  dom.newQuoteBtn.addEventListener('click', () => {
    triggerSpinAnimation();
    store.nextQuote();
  });

  // Favorite Toggle Action
  dom.favoriteBtn.addEventListener('click', () => {
    const isNowFav = store.toggleFavorite();
    showToast(isNowFav ? 'Added to favorites ❤️' : 'Removed from favorites');
  });

  // Copy Quote to Clipboard
  dom.copyBtn.addEventListener('click', async () => {
    const current = store.getState().currentQuote;
    if (!current) return;
    const formatted = `“${current.text}” — ${current.author}`;
    const ok = await copyToClipboard(formatted);
    if (ok) {
      showToast('Quote copied to clipboard! 📋');
    } else {
      showToast('Could not copy to clipboard.');
    }
  });

  // Share Quote
  dom.shareBtn.addEventListener('click', () => {
    const current = store.getState().currentQuote;
    if (current) {
      shareQuote(current);
    }
  });

  // Drawer Toggles
  dom.viewFavoritesBtn.addEventListener('click', openDrawer);
  dom.closeDrawerBtn.addEventListener('click', closeDrawer);
  dom.drawerBackdrop.addEventListener('click', closeDrawer);

  // Global Keyboard Shortcuts
  window.addEventListener('keydown', (e) => {
    // Ignore keystrokes when user is typing in form inputs (if any)
    const activeTag = document.activeElement ? document.activeElement.tagName.toLowerCase() : '';
    if (activeTag === 'input' || activeTag === 'textarea') return;

    // Escape closes drawer
    if (e.key === 'Escape' && dom.favoritesDrawer.classList.contains('open')) {
      closeDrawer();
      return;
    }

    // Space or N: New Quote (only if not focused on another button)
    if (e.key === ' ' || e.key === 'n' || e.key === 'N') {
      if (e.key === ' ' && activeTag === 'button') {
        // Allow default button click behavior
        return;
      }
      e.preventDefault();
      triggerSpinAnimation();
      store.nextQuote();
      return;
    }

    // F: Toggle Favorite
    if (e.key === 'f' || e.key === 'F') {
      e.preventDefault();
      const isNowFav = store.toggleFavorite();
      showToast(isNowFav ? 'Added to favorites ❤️' : 'Removed from favorites');
      return;
    }
  });
}

/**
 * Bootstraps the application.
 */
function initApp() {
  store.subscribe(onStateChange);
  setupEventListeners();
  store.init();
}

// Start application when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}
