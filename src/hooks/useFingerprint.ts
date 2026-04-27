'use client';

import { useMemo } from 'react';

function hashString(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(36);
}

export function useFingerprint(): string {
  return useMemo(() => {
    if (typeof window === 'undefined') return 'server';
    const existing = localStorage.getItem('dtq_fingerprint');
    if (existing) return existing;

    const components = [
      navigator.userAgent,
      navigator.language,
      screen.width + 'x' + screen.height,
      screen.colorDepth,
      new Date().getTimezoneOffset(),
      navigator.hardwareConcurrency,
    ].join('|');

    const fp = hashString(components) + '-' + Date.now().toString(36);
    localStorage.setItem('dtq_fingerprint', fp);
    return fp;
  }, []);
}
