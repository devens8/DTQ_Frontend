'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import Image from 'next/image';
import type { TrackResult } from '@/types';

interface Props {
  roomId: string;
  onClose: () => void;
  onRequested: (message: string) => void;
}

type Stage = 'search' | 'confirm';

function fmtDuration(ms: number) {
  return `${Math.floor(ms / 60000)}:${String(Math.floor((ms % 60000) / 1000)).padStart(2, '0')}`;
}

export default function RequestModal({ roomId, onClose, onRequested }: Props) {
  const [stage, setStage] = useState<Stage>('search');
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [selectedTrack, setSelectedTrack] = useState<TrackResult | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), 300);
    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 100);
  }, []);

  const { data: results = [] as TrackResult[], isLoading: searching } = useQuery<TrackResult[]>({
    queryKey: ['music-search', debouncedQuery],
    queryFn: () => api.music.search(debouncedQuery) as unknown as Promise<TrackResult[]>,
    enabled: debouncedQuery.length >= 2,
    staleTime: 30000,
  });

  async function handleSubmit() {
    if (!selectedTrack) return;
    setIsSubmitting(true);
    setSubmitError('');
    try {
      await api.requests.submit(roomId, selectedTrack.trackId, selectedTrack.source);
      onRequested(`"${selectedTrack.title}" added to queue`);
      onClose();
    } catch (err: any) {
      const data = err?.response?.data;
      if (data?.error === 'COOLDOWN_ACTIVE') {
        const secs = Math.ceil((new Date(data.cooldownEndsAt).getTime() - Date.now()) / 1000);
        setSubmitError(`Cooldown active — wait ${secs}s`);
      } else if (data?.error === 'REQUEST_LIMIT_REACHED') {
        setSubmitError('Max 3 active requests reached');
      } else {
        setSubmitError(data?.message || 'Request failed');
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex flex-col justify-end"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/80"
        onClick={onClose}
      />

      {/* Sheet */}
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        className="relative bg-[#0a0a0a] max-h-[90vh] flex flex-col border-t border-[#2a2a2a]"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#1a1a1a]">
          {stage === 'confirm' ? (
            <button
              onClick={() => { setStage('search'); setSubmitError(''); }}
              className="text-[#888] text-xs hover:text-white transition-colors"
            >
              ← Back
            </button>
          ) : (
            <span className="text-xs font-mono text-[#555] uppercase tracking-widest">Request a Song</span>
          )}
          <button
            onClick={onClose}
            className="text-[#555] hover:text-white transition-colors text-sm w-8 h-8 flex items-center justify-center"
          >
            ✕
          </button>
        </div>

        <AnimatePresence mode="wait">
          {stage === 'search' ? (
            <motion.div
              key="search"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col flex-1 min-h-0"
            >
              {/* Search input */}
              <div className="px-4 py-3 border-b border-[#1a1a1a]">
                <div className="flex items-center gap-3 bg-black border border-[#2a2a2a] px-3 py-2.5 focus-within:border-[#555] transition-colors">
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="text-[#555] flex-shrink-0">
                    <circle cx="6" cy="6" r="5" stroke="currentColor" strokeWidth="1.5" />
                    <path d="M10 10L13 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" />
                  </svg>
                  <input
                    ref={inputRef}
                    type="text"
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                    placeholder="Search songs or artists..."
                    className="flex-1 bg-transparent text-white text-sm outline-none placeholder:text-[#444]"
                  />
                  {query && (
                    <button onClick={() => setQuery('')} className="text-[#444] hover:text-white text-sm transition-colors">
                      ✕
                    </button>
                  )}
                </div>
              </div>

              {/* Results */}
              <div className="flex-1 overflow-y-auto">
                {searching ? (
                  <div className="space-y-0">
                    {[1, 2, 3, 4, 5].map(i => (
                      <div key={i} className="flex gap-3 items-center px-4 py-3 border-b border-[#1a1a1a] animate-pulse">
                        <div className="w-10 h-10 bg-[#1a1a1a] flex-shrink-0" />
                        <div className="flex-1">
                          <div className="h-3 bg-[#1a1a1a] w-3/4 mb-2" />
                          <div className="h-2.5 bg-[#1a1a1a] w-1/2" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : results.length > 0 ? (
                  <div>
                    {results.map((track: TrackResult) => (
                      <button
                        key={track.trackId}
                        onClick={() => { setSelectedTrack(track); setStage('confirm'); }}
                        className="w-full flex items-center gap-3 px-4 py-3 border-b border-[#1a1a1a] hover:bg-[#111] transition-colors text-left"
                      >
                        <div className="w-10 h-10 flex-shrink-0 bg-[#1a1a1a] overflow-hidden">
                          {track.albumArtUrl && (
                            <Image src={track.albumArtUrl} alt="" width={40} height={40} className="w-full h-full object-cover" unoptimized />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-white font-medium truncate">{track.title}</p>
                          <p className="text-xs text-[#555] truncate mt-0.5">{track.artist}</p>
                        </div>
                        <span className="text-[10px] font-mono text-[#444] flex-shrink-0">
                          {fmtDuration(track.durationMs)}
                        </span>
                      </button>
                    ))}
                  </div>
                ) : query.length >= 2 ? (
                  <div className="px-4 py-10 text-center">
                    <p className="text-[#555] text-sm">No results for &quot;{query}&quot;</p>
                  </div>
                ) : (
                  <div className="px-4 py-8">
                    <p className="text-[10px] font-mono text-[#333] uppercase tracking-widest mb-3">
                      Top Songs
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="confirm"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="px-4 py-5 pb-8"
            >
              {selectedTrack && (
                <>
                  <div className="flex gap-4 items-center mb-6 pb-6 border-b border-[#1a1a1a]">
                    <div className="w-16 h-16 flex-shrink-0 bg-[#1a1a1a] overflow-hidden">
                      {selectedTrack.albumArtUrl && (
                        <Image src={selectedTrack.albumArtUrl} alt="" width={64} height={64} className="w-full h-full object-cover" unoptimized />
                      )}
                    </div>
                    <div>
                      <p className="font-bold text-white text-base leading-tight">{selectedTrack.title}</p>
                      <p className="text-[#888] text-sm mt-0.5">{selectedTrack.artist}</p>
                      <p className="text-[10px] font-mono text-[#444] mt-1.5">{fmtDuration(selectedTrack.durationMs)}</p>
                    </div>
                  </div>

                  {submitError && (
                    <div className="border border-red-900/60 bg-[#0d0000] px-3 py-2.5 mb-4 text-red-400 text-xs font-mono">
                      {submitError}
                    </div>
                  )}

                  <button
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="w-full bg-white hover:bg-[#f0f0f0] disabled:bg-[#1a1a1a] disabled:text-[#555]
                               text-black font-bold text-sm py-3.5 rounded-none
                               transition-colors flex items-center justify-center gap-2 mb-2"
                  >
                    {isSubmitting ? (
                      <div className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                    ) : 'Request This Song'}
                  </button>

                  <p className="text-center text-[10px] text-[#444] font-mono">
                    Others can vote to move it up the queue
                  </p>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}
