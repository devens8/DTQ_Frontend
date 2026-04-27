'use client';

import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Image from 'next/image';
import type { NowPlayingTrack } from '@/types';
import PlayerProgress from './PlayerProgress';

interface Props {
  track: NowPlayingTrack | null;
  roomMode: string;
}

function fmt(ms: number) {
  const s = Math.floor(ms / 1000);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

export default function NowPlaying({ track, roomMode }: Props) {
  const [progressMs, setProgressMs] = useState(0);

  useEffect(() => {
    if (track) setProgressMs(track.progressMs || 0);
  }, [track?.trackId]);

  useEffect(() => {
    if (!track) return;
    const interval = setInterval(() => {
      setProgressMs(p => Math.min(p + 1000, track.durationMs));
    }, 1000);
    return () => clearInterval(interval);
  }, [track?.trackId, track?.durationMs]);

  if (!track) {
    return (
      <div className="border-b border-[#1a1a1a] px-4 py-5">
        <div className="animate-pulse flex gap-4 items-center">
          <div className="w-14 h-14 bg-[#1a1a1a] flex-shrink-0" />
          <div className="flex-1">
            <div className="h-2.5 bg-[#1a1a1a] rounded-none w-24 mb-2" />
            <div className="h-4 bg-[#1a1a1a] rounded-none w-40 mb-1.5" />
            <div className="h-3 bg-[#1a1a1a] rounded-none w-28" />
          </div>
        </div>
      </div>
    );
  }

  const pct = track.durationMs ? Math.round((progressMs / track.durationMs) * 100) : 0;

  return (
    <div className="border-b border-[#1a1a1a]">
      <AnimatePresence mode="wait">
        <motion.div
          key={track.trackId}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="px-4 py-4"
        >
          <div className="flex gap-4 items-center">
            {/* Album art */}
            <div className="w-14 h-14 flex-shrink-0 bg-[#1a1a1a] overflow-hidden">
              {track.albumArtUrl ? (
                <Image
                  src={track.albumArtUrl}
                  alt={track.title}
                  width={56}
                  height={56}
                  className="w-full h-full object-cover"
                  unoptimized
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="w-6 h-6 border border-[#333]" />
                </div>
              )}
            </div>

            {/* Track info */}
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-mono text-[#555] uppercase tracking-widest mb-1">
                Now Playing
              </p>
              <p className="text-white font-semibold text-sm truncate leading-tight">{track.title}</p>
              <p className="text-[#888] text-xs truncate mt-0.5">{track.artist}</p>
            </div>

            {/* Time */}
            <div className="flex-shrink-0 text-right">
              <p className="text-[10px] font-mono text-[#555] tabular">
                {fmt(progressMs)} / {fmt(track.durationMs)}
              </p>
              <p className="text-[10px] font-mono text-[#333] mt-0.5 tabular">{pct}%</p>
            </div>
          </div>

          {/* Progress bar */}
          <div className="mt-3">
            <div className="h-px bg-[#1a1a1a] w-full">
              <div
                className="h-px bg-white transition-all duration-1000"
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
