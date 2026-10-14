# Specification: Quote of the Day Web Application

## 1. Overview
The Quote of the Day web application delivers an inspiring, distraction-free reading experience. It displays curated quotes, allows users to cycle through new random quotes on demand, and provides a persistent favoriting system so users can curate and revisit their favorite quotes across browser sessions.

## 2. Functional Requirements

### FR-1: Curated Quote Catalog
- The application includes an embedded, high-quality quote catalog of at least 25 diverse quotes spanning philosophy, science, literature, art, and leadership.
- Each quote record must possess:
  - `id` (unique string or integer identifier)
  - `text` (the quote body)
  - `author` (the speaker/author, or "Unknown")
  - `category` (the thematic tag, e.g., "Wisdom", "Perseverance", "Creativity", "Science")

### FR-2: Initial Quote & "Quote of the Day"
- On initial page load, the application displays a quote.
- The quote displays the text, author, and category badge.
- A smooth visual transition (fade-in or subtle scale) accompanies quote rendering.

### FR-3: "New Quote" Action
- A prominent, accessible "New Quote" button allows the user to display another quote.
- The selection algorithm selects a random quote from the catalog while guaranteeing that the current quote is not immediately repeated (as long as the catalog has more than 1 quote).
- Screen readers receive dynamic updates via an `aria-live="polite"` region when the quote changes.
- Keyboard shortcut: Pressing `Space` (when not focused on an interactive control) or `N` triggers a new quote.

### FR-4: Favoriting System & Persistence
- A toggle button (e.g., heart icon) on the current quote card allows users to mark/unmark the quote as a favorite.
- Visual feedback clearly indicates favorited state (e.g., filled crimson heart vs. outline heart, updated `aria-pressed` attribute).
- Favorites persist in `localStorage` under a versioned key (`qod_favorites_v1`).
- Favorited quotes remain favorited across page refreshes and browser reloads.
- Keyboard shortcut: Pressing `F` toggles the favorite state for the active quote.

### FR-5: Favorites Management (Drawer / Modal View)
- A "Favorites" button with an active counter badge indicates how many quotes have been favorited.
- Clicking the button opens an accessible modal/drawer displaying the list of all saved quotes.
- Users can remove an item from favorites directly from this list.
- An empty state message is shown if no quotes have been favorited yet ("No favorites saved yet. Click the heart icon to save quotes you love!").
- Users can click any quote in the favorites list to view it on the main display card.
- Modal can be closed via a Close button, clicking the backdrop, or pressing the `Escape` key.

### FR-6: Utility Features
- "Copy Quote" button that copies `"Quote text" — Author` to the system clipboard, with a transient toast confirmation ("Copied to clipboard!").
- "Share on X/Twitter" or Web Share API integration to easily share inspiring quotes.

## 3. Non-Functional Requirements
- **Performance:** Instant first contentful paint (< 100ms), zero network requests required for offline or local viewing.
- **Responsiveness:** Flawless layout on viewports from 320px (mobile) to 4K desktop screens.
- **Theme Support:** Clean, aesthetic theme with automatic light/dark mode adaptation matching system preferences (`prefers-color-scheme`).
- **Resilience:** Graceful fallback if `localStorage` is disabled or blocked (cookies disabled/incognito mode restriction); app continues to work with in-memory state and notifies user without crashing.

## 4. Acceptance Criteria
1. Loading the page displays a random quote and its author.
2. Clicking "New Quote" changes the displayed quote without repeating the active quote.
3. Clicking the Favorite button toggles the active quote's favorite status.
4. Reloading the page retains all previously favorited quotes.
5. Opening the Favorites drawer shows all favorited quotes with their authors and allows individual removal.
6. The entire UI is navigable via keyboard and accessible to screen readers.
