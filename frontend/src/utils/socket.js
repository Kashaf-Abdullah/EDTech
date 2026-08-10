import { io } from 'socket.io-client';

let socket = null;

// Connects directly to backend on :5000 (matches CRA proxy target).
// In production, set this to your deployed backend URL via env var.
const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000';

export const connectSocket = (token) => {
  if (socket?.connected) return socket;
  socket = io(SOCKET_URL, {
    auth: { token },
    transports: ['websocket', 'polling'],
  });
  return socket;
};

export const getSocket = () => socket;

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
