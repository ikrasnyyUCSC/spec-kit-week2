# Project Constitution: Principles of Excellence

## 1. Core Principles

### 1.1 Code Quality
- **Single Responsibility Principle (SRP):** Every module, function, and file must have a single, well-defined reason to change. Business logic, state management, persistent storage, and DOM rendering are decoupled into isolated modules.
- **Defensive & Resilient Design:** Never assume external browser APIs (such as `localStorage` or `navigator.clipboard`) are always functional or permitted. Gracefully fall back (e.g., in-memory session cache for blocked storage, visual fallback for clipboard).
- **Zero Third-Party Runtime Dependencies:** Deliver the application using standard modern web capabilities (HTML5 semantic markup, CSS3 custom properties & Flexbox/Grid, and ES6+ JavaScript modules) to ensure lightning-fast load times and zero supply-chain vulnerabilities.
- **Accessibility (a11y) First:** Adhere to WCAG 2.1 AA standards. Ensure keyboard navigability (focus states, logical tab order, hotkeys), appropriate ARIA landmarks, `aria-live` announcements for dynamic quote updates, and sufficient color contrast ratios.

### 1.2 Testing & Verification
- **Automated Domain & Unit Testing:** All core business logic—quote selection algorithms, storage adapters, state transitions, and serialization/deserialization—must be covered by automated unit tests.
- **Test Isolation & Determinism:** Tests must be independent and reproducible with zero side effects. Persistent storage must be mockable/swappable without polluting real browser storage.
- **Edge Case Coverage:** Explicit tests for edge conditions: corrupted localStorage payloads, missing keys, empty arrays, repeated quote avoidance, and rapid user interactions.

### 1.3 Maintainability & Clean Architecture
- **Self-Documenting Code:** Clean, expressive naming conventions for functions, variables, and events. Inline documentation explains the *why*, not just the *what*.
- **Single Source of Truth (SSOT):** Application state flows unidirectionally. UI components read from the state store and dispatch actions; the state updates the storage and notifies listeners.
- **Extensibility:** The quote catalog, storage backend, and theme can be updated or extended without breaking existing code or requiring structural refactoring.
