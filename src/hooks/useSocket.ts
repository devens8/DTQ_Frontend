'use client';

import { useEffect, useState } from 'react';
import { Socket } from 'socket.io-client';
import { getSocket, disconnectSocket } from '@/lib/socket';

export function useSocket(roomId?: string) {
  const [isConnected, setIsConnected] = useState(false);
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:3001';
    const s = getSocket(wsUrl);
    setSocket(s);

    function onConnect() { setIsConnected(true); }
    function onDisconnect() { setIsConnected(false); }

    s.on('connect', onConnect);
    s.on('disconnect', onDisconnect);
    if (s.connected) setIsConnected(true);

    return () => {
      s.off('connect', onConnect);
      s.off('disconnect', onDisconnect);
    };
  }, []);

  return { socket, isConnected };
}
