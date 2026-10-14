# Quote of the Day

An elegant, distraction-free, zero-dependency Quote of the Day web application featuring a curated catalog of timeless wisdom, randomized quote generation, keyboard shortcuts, and persistent favoriting via `localStorage`.

Built following **Spec-Kit** engineering practices with a focus on code quality, testing, and maintainability.

---

## Features

- **Curated Quote Catalog:** Over 30 diverse quotes across Philosophy, Resilience, Science, Creativity, Art, and Wisdom.
- **Quote of the Day & Random Selection:** Deterministic quote for each calendar day, with an instantaneous "New Quote" button that prevents immediate repeats.
- **Persistent Favorites:** Mark quotes as favorites with a single click or keyboard shortcut. Favorites persist across page reloads and browser sessions using resilient `localStorage` management.
- **Favorites Drawer:** Browse, view, or remove saved favorites in an accessible slide-over panel with an active counter badge.
- **Utility Actions:**
  - **Copy to Clipboard:** Formatted `“Quote” — Author` with automatic clipboard fallback and toast notification.
  - **Social Sharing:** Web Share API integration with Twitter/X fallback.
- **Keyboard Shortcuts:**
  - <kbd>Space</kbd> or <kbd>N</kbd> — Generate new quote
  - <kbd>F</kbd> — Toggle favorite for active quote
  - <kbd>Esc</kbd> — Close favorites drawer
- **Accessibility (a11y):** WCAG AA compliant with semantic HTML5 landmarks, ARIA live regions for screen readers, high contrast ratios, and clear `:focus-visible` outlines.
- **Zero Dependencies:** Pure HTML5, modern CSS3 (with automatic dark/light theme adaptation via `prefers-color-scheme`), and ES6+ modules.

---

## Project Structure

```
quote-of-the-day/
├── .speckit/
│   ├── constitution.md     # Code quality, testing, and maintainability principles
│   ├── specification.md    # Functional & non-functional requirements
│   ├── plan.md             # Technical architecture & component design
│   └── tasks.md            # Work breakdown structure & progress tracking
├── css/
│   └── style.css           # Modern, responsive CSS with dark/light themes
├── js/
│   ├── app.js              # View controller, DOM events, and keyboard shortcuts
│   ├── quotes.js           # Curated quote collection and selection algorithms
│   ├── state.js            # Reactive state management and subscriber events
│   ├── storage.js          # Resilient storage adapter with memory fallback
│   └── utils.js            # Clipboard, share, and toast utilities
├── tests/
│   ├── quotes.test.js      # Unit tests for quote domain logic
│   ├── state.test.js       # Unit tests for reactive state store & actions
│   ├── storage.test.js     # Unit tests for storage serialization & error recovery
│   └── utils.test.js       # Unit tests for utility functions
├── index.html              # Main application entry point
├── package.json            # NPM configuration & test runner
└── README.md               # Documentation
```

---

## Running the Application

Because this application uses standard ES6 modules, open it using any standard local HTTP static file server, for example:

### Using Python:
```bash
python3 -m http.server 8000
```
Then navigate to `http://localhost:8000`.

### Using Node / npx:
```bash
npx serve .
```

---

## Running Tests

Automated testing uses the native Node.js test runner (`node:test` and `node:assert`), requiring no third-party test libraries or network access:

```bash
npm test
```
All 18 unit tests will execute and report passing status.
