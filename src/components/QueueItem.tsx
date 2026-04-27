'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import type { SongRequest } from '@/types';

interface Props {
  request: SongRequest;
  rank: number;
  onVote: () => void;
  userHasVoted: boolean;
}

export default function QueueItem({ request, rank, onVote, userHasVoted }: Props) {
  const isBoosted = request.boostScore > 0;
  const isMustPlay = request.priorityTag === 'must_play';

  return (
    <motion.div
      layout
      layoutId={request.id}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={`flex items-center gap-0 border-b border-[#1a1a1a] ${
        isMustPlay
          ? 'bg-[#0d0000]'
          : isBoosted
          ? 'bg-[#0d0800]'
          : ''
      }`}
    >
      {/* Rank indicator */}
      <div className="w-10 flex-shrink-0 flex items-center justify-center py-4">
        <span className={`text-[10px] font-mono tabular ${
          rank === 1 ? 'text-white' : rank <= 3 ? 'text-[#555]' : 'text-[#333]'
        }`}>
          {String(rank).padStart(2, '0')}
        </span>
      </div>

      {/* Album art */}
      <div className="w-10 h-10 flex-shrink-0 bg-[#0a0a0a] overflow-hidden border-r border-[#1a1a1a]">
        {request.albumArtUrl ? (
          <Image
            src={request.albumArtUrl}
            alt={request.title}
            width={40}
            height={40}
            className="w-full h-full object-cover"
            unoptimized
          />
        ) : (
          <div className="w-full h-full" />
        )}
      </div>

      {/* Track info */}
      <div className="flex-1 min-w-0 px-3 py-3">
        <div className="flex items-center gap-2">
          {isMustPlay && (
            <span className="text-[9px] font-mono text-red-400 border border-red-900/60 px-1 py-px uppercase tracking-wider">
              MUST PLAY
            </span>
          )}
          {isBoosted && !isMustPlay && (
            <span className="text-[9px] font-mono text-amber-400/80 border border-amber-900/40 px-1 py-px uppercase tracking-wider">
              BOOSTED
            </span>
          )}
          <p className="text-sm text-white font-medium truncate">{request.title}</p>
        </div>
        <p className="text-xs text-[#555] truncate mt-0.5">{request.artist}</p>
      </div>

      {/* Vote button */}
      <button
        onClick={() => { if (!userHasVoted) onVote(); }}
        disabled={userHasVoted}
        className={`flex flex-col items-center justify-center gap-0.5 w-14 py-4 border-l border-[#1a1a1a] flex-shrink-0 transition-colors
          ${userHasVoted
            ? 'text-white cursor-default'
            : 'text-[#555] hover:text-white active:bg-[#0a0a0a]'
          }`}
      >
        <svg width="10" height="8" viewBox="0 0 10 8" fill="currentColor">
          <path d="M5 0L10 8H0L5 0Z" />
        </svg>
        <span className="text-[11px] font-mono tabular font-bold">{request.voteCount}</span>
      </button>
    </motion.div>
  );
}
