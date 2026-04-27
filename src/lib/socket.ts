import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export function getSocket(wsUrl?: string): Socket {
  if (socket?.connected) return socket;

  const url = wsUrl || process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:3001';
  const token = typeof window !== 'undefined' ? localStorage.getItem('dtq_token') : null;

  socket = io(url, {
    auth: token ? { token } : {},
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    reconnectionAttempts: 10,
    transports: ['websocket', 'polling'],
  });

  return socket;
}

export function disconnectSocket(): void {
  socket?.disconnect();
  socket = null;
}
