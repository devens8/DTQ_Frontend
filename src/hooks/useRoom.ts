'use client';

import { useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { getSocket } from '@/lib/socket';
import { useRoomStore } from '@/store/roomStore';
import type { RoomState } from '@/types';

export function useRoom(code: string) {
  const queryClient = useQueryClient();
  const { setRoom, setNowPlaying, updateQueue, triggerCelebration, setConnected } = useRoomStore();

  const { data, isLoading, error } = useQuery<RoomState>({
    queryKey: ['room', code],
    queryFn: () => api.rooms.getByCode(code) as unknown as Promise<RoomState>,
    retry: 2,
    staleTime: 10000,
  });

  // Hydrate store when initial data arrives
  useEffect(() => {
    if (!data) return;
    if (data.room) setRoom(data.room);
    if (data.nowPlaying) setNowPlaying(data.nowPlaying);
    if (data.queue) updateQueue(data.queue);
  }, [data]);

  // WebSocket setup
  useEffect(() => {
    if (!data?.room?.id) return;
    const roomId = data.room.id;
    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:3001';
    const socket = getSocket(wsUrl);

    const userId = typeof window !== 'undefined'
      ? (() => { try { return JSON.parse(localStorage.getItem('dtq_user') || '{}').id; } catch { return undefined; } })()
      : undefined;

    socket.emit('join_room', { roomId, userId });

    socket.on('connect', () => setConnected(true));
    socket.on('disconnect', () => setConnected(false));
    if (socket.connected) setConnected(true);

    socket.on('now_playing', (track) => {
      setNowPlaying(track);
      queryClient.setQueryData(['room', code], (old: any) => old ? { ...old, nowPlaying: track } : old);
    });

    socket.on('queue_update', ({ queue }) => {
      updateQueue(queue);
    });

    socket.on('room_mode_changed', ({ mode }) => {
      setRoom({ ...data.room, mode });
      queryClient.setQueryData(['room', code], (old: any) => old ? { ...old, room: { ...old.room, mode } } : old);
    });

    socket.on('your_song_playing', (payload) => {
      // Find matching request in queue to trigger celebration
      const store = useRoomStore.getState();
      const matchingReq = store.queue.find(r => r.title === payload.title);
      if (matchingReq) triggerCelebration(matchingReq);
    });

    socket.on('room_closed', () => {
      queryClient.setQueryData(['room', code], (old: any) => old ? { ...old, room: { ...old.room, status: 'closed' } } : old);
    });

    // Heartbeat every 30s
    const heartbeatInterval = setInterval(() => {
      socket.emit('heartbeat', { roomId, userId });
    }, 30000);

    return () => {
      socket.off('now_playing');
      socket.off('queue_update');
      socket.off('room_mode_changed');
      socket.off('your_song_playing');
      socket.off('room_closed');
      socket.off('connect');
      socket.off('disconnect');
      clearInterval(heartbeatInterval);
    };
  }, [data?.room?.id]);

  const store = useRoomStore.getState();

  return {
    room: data?.room || store.room,
    nowPlaying: data?.nowPlaying || store.nowPlaying,
    queue: store.queue,
    isLoading,
    error,
  };
}
