/**
 * Formatting Utilities
 * Helper functions for formatting data for display
 */

/**
 * Format amount as currency (USD)
 * @param {number} value - Amount to format
 * @returns {string} Formatted currency string
 */
export function formatAmount(value) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);
}

/**
 * Format date as relative time (e.g., "5m ago", "2h ago")
 * @param {string} dateStr - ISO date string
 * @returns {string} Relative time string
 */
export function timeAgo(dateStr) {
  const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);

  if (seconds < 5) return "just now";
  if (seconds < 60) return `${seconds}s ago`;

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}
