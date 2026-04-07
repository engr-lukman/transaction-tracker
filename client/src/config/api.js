/**
 * API Configuration
 * Centralized configuration for API endpoints and settings
 */

export const API_BASE_URL =
  import.meta.env.VITE_SERVER_URL || "http://localhost:3001";

export const API_ENDPOINTS = {
  TRANSACTIONS: "/api/transactions",
  TRANSACTION_BY_ID: (id) => `/api/transactions/${id}`,
};

export const API_CONFIG = {
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
};

/**
 * Get full API URL
 * @param {string} endpoint - Endpoint path
 * @returns {string} Full URL
 */
export const getApiUrl = (endpoint) => `${API_BASE_URL}${endpoint}`;
