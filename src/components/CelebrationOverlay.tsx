'use client';

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import type { SongRequest } from '@/types';

interface Props {
  track: SongRequest;
  onDismiss: () => void;
}

export default function CelebrationOverlay({ track, onDismiss }: Props) {
  useEffect(() => {
    const timer = setTimeout(onDismiss, 4000);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onDismiss}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 overflow-hidden"
    >
      {/* Scanline animation */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 0.04, 0] }}
        transition={{ repeat: Infinity, duration: 2 }}
        style={{
          backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.03) 2px, rgba(255,255,255,0.03) 4px)',
        }}
      />

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="text-center px-8 relative border border-[#2a2a2a] bg-[#050505] py-10 mx-6 max-w-sm w-full"
        onClick={e => e.stopPropagation()}
      >
        <p className="text-[10px] font-mono text-[#555] uppercase tracking-widest mb-4">
          Now Playing
        </p>

        <motion.div
          initial={{ scale: 0.9 }}
          animate={{ scale: [0.9, 1.02, 1] }}
          transition={{ delay: 0.15, duration: 0.4 }}
        >
          <h2 className="text-xl font-bold text-white mb-1 leading-tight">{track.title}</h2>
          <p className="text-[#888] text-sm">{track.artist}</p>
        </motion.div>

        <div className="mt-6 h-px bg-[#1a1a1a]">
          <motion.div
            className="h-px bg-white"
            initial={{ width: '0%' }}
            animate={{ width: '100%' }}
            transition={{ duration: 4, ease: 'linear' }}
          />
        </div>

        <p className="text-[#333] text-[10px] font-mono mt-4 uppercase tracking-wider">
          Your song is playing — tap to dismiss
        </p>

        {typeof navigator !== 'undefined' && 'share' in navigator && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            onClick={() => navigator.share({ title: 'DropTheQueue', text: `My song "${track.title}" is playing!` })}
            className="mt-4 px-4 py-2 border border-[#2a2a2a] text-[#555] hover:border-white hover:text-white text-[11px] font-mono transition-colors"
          >
            Share
          </motion.button>
        )}
      </motion.div>
    </motion.div>
  );
}
