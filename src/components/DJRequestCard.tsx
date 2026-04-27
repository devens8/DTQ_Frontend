'use client';

import { useState } from 'react';
import Image from 'next/image';
import type { SongRequest } from '@/types';

interface Props {
  request: SongRequest;
  isTopRequest: boolean;
  onAccept: () => void;
  onReject: () => void;
}

function fmtTime(dateStr: string) {
  const d = new Date(dateStr);
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}:${String(d.getSeconds()).padStart(2, '0')}`;
}

export default function DJRequestCard({ request, isTopRequest, onAccept, onReject }: Props) {
  const [accepting, setAccepting] = useState(false);
  const [rejecting, setRejecting] = useState(false);

  const isMustPlay = request.priorityTag === 'must_play';
  const isBoosted = request.boostScore > 0;

  async function handleAccept() {
    setAccepting(true);
    try { await onAccept(); } finally { setAccepting(false); }
  }
  async function handleReject() {
    setRejecting(true);
    try { await onReject(); } finally { setRejecting(false); }
  }

  return (
    <div className={`border-b border-[#1a1a1a] ${
      isMustPlay
        ? 'bg-[#0d0000] border-l-2 border-l-red-700'
        : isBoosted
        ? 'bg-[#0d0800] border-l-2 border-l-amber-700'
        : isTopRequest
        ? 'border-l-2 border-l-white'
        : ''
    }`}>
      <div className="flex items-center gap-0">
        {/* Album art */}
        <div className="w-12 h-12 flex-shrink-0 bg-[#0a0a0a] overflow-hidden">
          {request.albumArtUrl ? (
            <Image src={request.albumArtUrl} alt="" width={48} height={48} className="w-full h-full object-cover" unoptimized />
          ) : (
            <div className="w-full h-full bg-[#111]" />
          )}
        </div>

        {/* Track info */}
        <div className="flex-1 min-w-0 px-3 py-2.5">
          <div className="flex items-center gap-2 flex-wrap">
            {isMustPlay && (
              <span className="text-[9px] font-mono text-red-400 border border-red-900/50 px-1 py-px uppercase tracking-wider">
                MUST PLAY
              </span>
            )}
            {isBoosted && !isMustPlay && (
              <span className="text-[9px] font-mono text-amber-400/80 border border-amber-900/40 px-1 py-px uppercase tracking-wider">
                +${request.boostScore.toFixed(0)}
              </span>
            )}
            <p className="text-sm text-white font-medium truncate">{request.title}</p>
          </div>
          <p className="text-xs text-[#555] truncate mt-0.5">{request.artist}</p>
          <div className="flex items-center gap-3 mt-1">
            <span className="text-[10px] font-mono text-[#888] tabular">
              {request.voteCount}v
            </span>
            {request.bpm && (
              <span className="text-[10px] font-mono text-[#444]">{request.bpm} bpm</span>
            )}
            {request.requesterName && (
              <span className="text-[10px] text-[#333] truncate">
                {request.requesterName}
              </span>
            )}
            {request.requestedAt && (
              <span className="text-[10px] font-mono text-[#333] tabular ml-auto">
                {fmtTime(String(request.requestedAt))}
              </span>
            )}
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex flex-shrink-0 h-12 border-l border-[#1a1a1a]">
          <button
            onClick={handleAccept}
            disabled={accepting || rejecting}
            className="w-12 h-full flex items-center justify-center text-[#888] hover:bg-white hover:text-black disabled:opacity-30 transition-colors border-r border-[#1a1a1a]"
            title="Accept"
          >
            {accepting ? (
              <div className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin" />
            ) : (
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M1 6L4.5 9.5L11 2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" strokeLinejoin="miter" />
              </svg>
            )}
          </button>
          <button
            onClick={handleReject}
            disabled={accepting || rejecting}
            className="w-12 h-full flex items-center justify-center text-[#555] hover:bg-[#1a1a1a] hover:text-white disabled:opacity-30 transition-colors"
            title="Reject"
          >
            {rejecting ? (
              <div className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin" />
            ) : (
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                <path d="M1 1L9 9M9 1L1 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" />
              </svg>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
