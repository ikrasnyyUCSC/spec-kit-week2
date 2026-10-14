/**
 * Curated Catalog of Quotes & Selection Logic
 * Contains diverse, timeless quotes with authors, categories, and helpers.
 */

export const QUOTES = Object.freeze([
  {
    id: 1,
    text: "The happiness of your life depends upon the quality of your thoughts.",
    author: "Marcus Aurelius",
    category: "Wisdom"
  },
  {
    id: 2,
    text: "You may encounter many defeats, but you must not be defeated.",
    author: "Maya Angelou",
    category: "Resilience"
  },
  {
    id: 3,
    text: "Imagination is more important than knowledge. For knowledge is limited, whereas imagination embraces the entire world.",
    author: "Albert Einstein",
    category: "Creativity"
  },
  {
    id: 4,
    text: "No need to hurry. No need to sparkle. No need to be anybody but oneself.",
    author: "Virginia Woolf",
    category: "Mindfulness"
  },
  {
    id: 5,
    text: "The journey of a thousand miles begins with a single step.",
    author: "Lao Tzu",
    category: "Philosophy"
  },
  {
    id: 6,
    text: "That brain of mine is something more than merely mortal; as time will show.",
    author: "Ada Lovelace",
    category: "Science"
  },
  {
    id: 7,
    text: "It always seems impossible until it is done.",
    author: "Nelson Mandela",
    category: "Perseverance"
  },
  {
    id: 8,
    text: "Somewhere, something incredible is waiting to be known.",
    author: "Carl Sagan",
    category: "Curiosity"
  },
  {
    id: 9,
    text: "Nothing in life is to be feared, it is only to be understood. Now is the time to understand more, so that we may fear less.",
    author: "Marie Curie",
    category: "Courage"
  },
  {
    id: 10,
    text: "Not everything that is faced can be changed, but nothing can be changed until it is faced.",
    author: "James Baldwin",
    category: "Inspiration"
  },
  {
    id: 11,
    text: "Simplicity is the ultimate sophistication.",
    author: "Leonardo da Vinci",
    category: "Art & Design"
  },
  {
    id: 12,
    text: "The only true wisdom is in knowing you know nothing.",
    author: "Socrates",
    category: "Wisdom"
  },
  {
    id: 13,
    text: "We do not see things as they are, we see them as we are.",
    author: "Anaïs Nin",
    category: "Perception"
  },
  {
    id: 14,
    text: "Life is what happens when you're busy making other plans.",
    author: "John Lennon",
    category: "Life"
  },
  {
    id: 15,
    text: "Do what you can, with what you have, where you are.",
    author: "Theodore Roosevelt",
    category: "Action"
  },
  {
    id: 16,
    text: "Knowing yourself is the beginning of all wisdom.",
    author: "Aristotle",
    category: "Philosophy"
  },
  {
    id: 17,
    text: "In the middle of difficulty lies opportunity.",
    author: "Albert Einstein",
    category: "Resilience"
  },
  {
    id: 18,
    text: "If I have seen further, it is by standing on the shoulders of giants.",
    author: "Isaac Newton",
    category: "Science"
  },
  {
    id: 19,
    text: "Tell me and I forget. Teach me and I remember. Involve me and I learn.",
    author: "Benjamin Franklin",
    category: "Learning"
  },
  {
    id: 20,
    text: "There is no greater agony than bearing an untold story inside you.",
    author: "Maya Angelou",
    category: "Expression"
  },
  {
    id: 21,
    text: "The only limit to our realization of tomorrow will be our doubts of today.",
    author: "Franklin D. Roosevelt",
    category: "Hope"
  },
  {
    id: 22,
    text: "What you do makes a difference, and you have to decide what kind of difference you want to make.",
    author: "Jane Goodall",
    category: "Purpose"
  },
  {
    id: 23,
    text: "I have not failed. I've just found 10,000 ways that won't work.",
    author: "Thomas Edison",
    category: "Perseverance"
  },
  {
    id: 24,
    text: "Quiet people have the loudest minds.",
    author: "Stephen Hawking",
    category: "Mindfulness"
  },
  {
    id: 25,
    text: "To live is the rarest thing in the world. Most people exist, that is all.",
    author: "Oscar Wilde",
    category: "Life"
  },
  {
    id: 26,
    text: "The best way to predict the future is to create it.",
    author: "Peter Drucker",
    category: "Action"
  },
  {
    id: 27,
    text: "We are what we repeatedly do. Excellence, then, is not an act, but a habit.",
    author: "Will Durant",
    category: "Habits"
  },
  {
    id: 28,
    text: "Spread love everywhere you go. Let no one ever come to you without leaving happier.",
    author: "Mother Teresa",
    category: "Compassion"
  },
  {
    id: 29,
    text: "He who has a why to live can bear almost any how.",
    author: "Friedrich Nietzsche",
    category: "Philosophy"
  },
  {
    id: 30,
    text: "Everything you've ever wanted is on the other side of fear.",
    author: "George Addair",
    category: "Courage"
  }
]);

/**
 * Returns all available quotes in the catalog.
 * @returns {readonly object[]}
 */
export function getAllQuotes() {
  return QUOTES;
}

/**
 * Find a quote by its unique ID.
 * @param {number|string} id
 * @returns {object|undefined}
 */
export function getQuoteById(id) {
  const numericId = Number(id);
  return QUOTES.find(q => q.id === numericId);
}

/**
 * Get a random quote, optionally excluding a specific ID to avoid immediate repetition.
 * @param {number|string} [excludeId]
 * @returns {object}
 */
export function getRandomQuote(excludeId = null) {
  if (QUOTES.length === 0) {
    throw new Error("Quote catalog is empty.");
  }
  if (QUOTES.length === 1) {
    return QUOTES[0];
  }

  const numericExcludeId = excludeId !== null ? Number(excludeId) : null;
  const candidates = numericExcludeId !== null
    ? QUOTES.filter(q => q.id !== numericExcludeId)
    : QUOTES;

  const randomIndex = Math.floor(Math.random() * candidates.length);
  return candidates[randomIndex];
}

/**
 * Deterministically picks a "Quote of the Day" based on calendar date.
 * Ensures all users visiting on the same calendar date see the same initial quote.
 * @param {Date} [date]
 * @returns {object}
 */
export function getQuoteOfTheDay(date = new Date()) {
  if (QUOTES.length === 0) {
    throw new Error("Quote catalog is empty.");
  }
  const year = date.getFullYear();
  const month = date.getMonth();
  const day = date.getDate();

  // Simple day-based hash
  const dayHash = Math.abs((year * 10000 + (month + 1) * 100 + day) % QUOTES.length);
  return QUOTES[dayHash];
}
