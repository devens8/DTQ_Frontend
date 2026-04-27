'use client';

import { useEffect, useState, useCallback } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useRoomStore } from '@/store/roomStore';
import { useRoom } from '@/hooks/useRoom';
import { useVote } from '@/hooks/useVote';
import NowPlaying from '@/components/NowPlaying';
import QueueItem from '@/components/QueueItem';
import RequestModal from '@/components/RequestModal';
import CelebrationOverlay from '@/components/CelebrationOverlay';
import Toast from '@/components/Toast';

interface Props {
  code: string;
}

export default function RoomView({ code }: Props) {
  const { room, nowPlaying, queue, isLoading, error } = useRoom(code);
  const {
    isRequestModalOpen,
    openRequestModal,
    closeRequestModal,
    celebrationTrack,
    dismissCelebration,
    isConnected,
  } = useRoomStore();
  const { vote } = useVote(room?.id || '');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);

  const showToast = useCallback((message: string, type: 'success' | 'info' | 'error' = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  useEffect(() => {
    if (!isConnected && room) showToast('Reconnecting...', 'info');
  }, [isConnected, room]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <div className="w-6 h-6 border border-[#333] border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !room) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-black px-6 text-center">
        <p className="text-[#888] text-sm mb-1">Room not found</p>
        <p className="text-[#555] text-xs mb-6">Check your code and try again</p>
        <a href="/" className="text-white text-xs border border-[#2a2a2a] px-4 py-2 hover:border-white transition-colors">
          ← Back
        </a>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-black relative">
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-[#1a1a1a]">
        <a href="/" className="text-[#555] text-xs hover:text-white transition-colors">← Back</a>
        <div className="text-center">
          <p className="font-semibold text-xs tracking-widest text-white uppercase">{room.name}</p>
          {room.dj && <p className="text-[10px] text-[#555] mt-0.5">DJ {room.dj.displayName}</p>}
        </div>
        <div className="flex items-center gap-2">
          <div
            title={isConnected ? 'Connected' : 'Disconnected'}
            className={`w-1.5 h-1.5 rounded-full ${isConnected ? 'bg-white' : 'bg-red-500 animate-pulse'}`}
          />
          <a href="/profile" className="text-[#555] text-xs hover:text-white transition-colors">
            Profile
          </a>
        </div>
      </div>

      {/* Override mode banner */}
      <AnimatePresence>
        {room.mode === 'override' && (
          <div className="bg-[#1a0000] border-b border-red-900/50 px-4 py-2 text-center text-red-400 text-xs font-mono uppercase tracking-widest">
            DJ OVERRIDE — Requests Paused
          </div>
        )}
      </AnimatePresence>

      {/* Now Playing */}
      <NowPlaying track={nowPlaying} roomMode={room.mode} />

      {/* Queue */}
      <div className="flex-1 pb-24 overflow-y-auto">
        {/* Queue header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#1a1a1a]">
          <span className="text-[10px] font-mono text-[#555] uppercase tracking-widest">
            Queue
          </span>
          {queue.length > 0 && (
            <span className="text-[10px] font-mono text-[#555]">{queue.length} pending</span>
          )}
        </div>

        {queue.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center px-6">
            <p className="text-[#444] text-sm">No requests yet</p>
            <p className="text-[#333] text-xs mt-1">Be the first to request a song</p>
          </div>
        ) : (
          <div>
            <AnimatePresence>
              {queue.map((req, index) => (
                <QueueItem
                  key={req.id}
                  request={req}
                  rank={index + 1}
                  onVote={() => vote(req.id)}
                  userHasVoted={req.userHasVoted}
                />
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Sticky Request Button */}
      <div className="fixed bottom-0 left-0 right-0 safe-bottom bg-black border-t border-[#1a1a1a] p-4">
        <button
          onClick={openRequestModal}
          disabled={room.mode === 'override'}
          className="w-full bg-white hover:bg-[#f0f0f0] disabled:bg-[#0a0a0a] disabled:text-[#333]
                     text-black font-bold text-sm py-3.5 rounded-none
                     transition-colors flex items-center justify-center gap-2"
        >
          {room.mode === 'override' ? 'Requests Paused' : 'Request a Song'}
        </button>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {isRequestModalOpen && room && (
          <RequestModal roomId={room.id} onClose={closeRequestModal} onRequested={(msg) => showToast(msg, 'success')} />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {celebrationTrack && (
          <CelebrationOverlay track={celebrationTrack} onDismiss={dismissCelebration} />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {toast && <Toast message={toast.message} type={toast.type} />}
      </AnimatePresence>
    </div>
  );
}
