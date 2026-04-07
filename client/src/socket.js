import { ref } from "vue";
import { io } from "socket.io-client";

const URL = import.meta.env.VITE_SERVER_URL || "http://localhost:3001";

export const socket = io(URL, {
  autoConnect: true,
});

export const isConnected = ref(false);

socket.on("connect", () => {
  isConnected.value = true;
});

socket.on("disconnect", () => {
  isConnected.value = false;
});
