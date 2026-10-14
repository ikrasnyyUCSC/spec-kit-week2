/**
 * Utility functions for clipboard, sharing, and notifications.
 */

/**
 * Copy text to clipboard with legacy execCommand fallback.
 * @param {string} text
 * @returns {Promise<boolean>}
 */
export async function copyToClipboard(text) {
  if (!text) return false;

  // Modern navigator.clipboard API
  if (typeof navigator !== 'undefined' && navigator.clipboard && navigator.clipboard.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (err) {
      console.warn('navigator.clipboard.writeText failed, trying fallback', err);
    }
  }

  // Fallback using textarea + execCommand
  try {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    const successful = document.execCommand('copy');
    document.body.removeChild(textArea);
    return successful;
  } catch (err) {
    console.error('Fallback clipboard copy failed:', err);
    return false;
  }
}

/**
 * Share a quote via Web Share API or open Twitter/X intent in new window.
 * @param {object} quote
 * @returns {Promise<void>}
 */
export async function shareQuote(quote) {
  if (!quote) return;
  const shareText = `"${quote.text}" — ${quote.author}`;

  if (typeof navigator !== 'undefined' && navigator.share) {
    try {
      await navigator.share({
        title: 'Quote of the Day',
        text: shareText
      });
      return;
    } catch (err) {
      if (err.name !== 'AbortError') {
        console.warn('Web Share failed, falling back to Twitter/X URL:', err);
      } else {
        return; // User canceled share sheet
      }
    }
  }

  // Fallback to Twitter / X share intent
  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`;
  window.open(twitterUrl, '_blank', 'noopener,noreferrer');
}

/**
 * Display an accessible floating toast message.
 * @param {string} message
 * @param {number} [duration=2500]
 */
export function showToast(message, duration = 2500) {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.setAttribute('role', 'status');
  toast.setAttribute('aria-live', 'polite');
  toast.textContent = message;

  container.appendChild(toast);

  // Trigger animation frame
  requestAnimationFrame(() => {
    toast.classList.add('toast-visible');
  });

  setTimeout(() => {
    toast.classList.remove('toast-visible');
    toast.addEventListener('transitionend', () => {
      toast.remove();
    }, { once: true });
  }, duration);
}
