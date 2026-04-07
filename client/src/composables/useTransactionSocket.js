/**
 * useTransactionSocket Composable
 * Manages Socket.io connection and real-time event handlers
 */

import { onMounted, onUnmounted } from "vue";
import { socket, isConnected } from "../socket.js";
import { SOCKET_EVENTS } from "../config/constants.js";

/**
 * Setup Socket.io event listeners for transaction updates
 * @param {Object} handlers - Event handler functions
 * @param {Function} handlers.onAdded - Called when transaction is added
 * @param {Function} handlers.onUpdated - Called when transaction is updated
 * @param {Function} handlers.onDeleted - Called when transaction is deleted
 */
export function useTransactionSocket(handlers) {
  /**
   * Attach all socket event listeners
   */
  function attachListeners() {
    // Detach first to prevent duplicate listeners
    socket.off(SOCKET_EVENTS.TRANSACTION_ADDED, handlers.onAdded);
    socket.off(SOCKET_EVENTS.TRANSACTION_UPDATED, handlers.onUpdated);
    socket.off(SOCKET_EVENTS.TRANSACTION_DELETED, handlers.onDeleted);

    // Attach listeners
    socket.on(SOCKET_EVENTS.TRANSACTION_ADDED, handlers.onAdded);
    socket.on(SOCKET_EVENTS.TRANSACTION_UPDATED, handlers.onUpdated);
    socket.on(SOCKET_EVENTS.TRANSACTION_DELETED, handlers.onDeleted);
  }

  /**
   * Detach all socket event listeners (cleanup)
   */
  function detachListeners() {
    socket.off(SOCKET_EVENTS.TRANSACTION_ADDED, handlers.onAdded);
    socket.off(SOCKET_EVENTS.TRANSACTION_UPDATED, handlers.onUpdated);
    socket.off(SOCKET_EVENTS.TRANSACTION_DELETED, handlers.onDeleted);
  }

  onMounted(() => {
    attachListeners();
  });

  onUnmounted(() => {
    detachListeners();
  });

  return {
    isConnected,
    attachListeners,
    detachListeners,
  };
}
