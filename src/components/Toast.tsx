'use client';

import { motion } from 'framer-motion';

interface Props {
  message: string;
  type: 'success' | 'info' | 'error';
}

const styles = {
  success: 'bg-[#0a0a0a] border-[#2a2a2a] text-white',
  info: 'bg-[#0a0a0a] border-[#2a2a2a] text-[#888]',
  error: 'bg-[#0d0000] border-red-900/60 text-red-400',
};

const icons = {
  success: (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
      <path d="M1 6L4.5 9.5L11 2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" />
    </svg>
  ),
  info: (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
      <circle cx="6" cy="6" r="5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M6 5V9M6 3.5V4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" />
    </svg>
  ),
  error: (
    <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
      <path d="M1 1L9 9M9 1L1 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" />
    </svg>
  ),
};

export default function Toast({ message, type }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8 }}
      className={`fixed bottom-24 left-4 right-4 z-50 px-4 py-3 border ${styles[type]}
                  flex items-center gap-3 text-xs font-mono shadow-2xl`}
    >
      <span className="flex-shrink-0">{icons[type]}</span>
      <span>{message}</span>
    </motion.div>
  );
}
