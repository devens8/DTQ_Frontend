'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function JoinForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const urlCode = searchParams.get('code');
    if (urlCode) {
      setCode(urlCode.toUpperCase());
      handleJoin(urlCode.toUpperCase());
    }
    inputRef.current?.focus();
  }, []);

  async function handleJoin(overrideCode?: string) {
    const roomCode = (overrideCode || code).trim().toUpperCase();
    if (!roomCode || roomCode.length < 4) {
      setError('Enter a valid room code');
      return;
    }
    setError('');
    setLoading(true);
    router.push(`/room/${roomCode}`);
  }

  return (
    <div className="min-h-screen bg-black flex flex-col">
      {/* Top nav */}
      <nav className="border-b border-[#1a1a1a] px-6 py-4 flex items-center justify-between">
        <span className="text-white font-bold tracking-tight text-sm">DROPTHEQUEUE</span>
        <a
          href="/dj/setup"
          className="text-[#888] text-xs hover:text-white transition-colors"
        >
          DJ Login →
        </a>
      </nav>

      {/* Main */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-16">
        <div className="w-full max-w-sm">
          {/* Headline */}
          <div className="mb-10">
            <h1 className="text-3xl font-bold text-white tracking-tight mb-2 leading-tight">
              Request a song.<br />Vote. Get it played.
            </h1>
            <p className="text-[#888] text-sm">
              Enter the room code shown at the venue.
            </p>
          </div>

          {/* Input */}
          <div className="mb-3">
            <label className="block text-xs text-[#555] uppercase tracking-widest mb-2 font-medium">
              Room Code
            </label>
            <input
              ref={inputRef}
              type="text"
              value={code}
              onChange={e => setCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''))}
              onKeyDown={e => e.key === 'Enter' && handleJoin()}
              placeholder="FIRE24"
              maxLength={8}
              className="w-full bg-[#0a0a0a] text-white text-2xl font-bold tracking-[0.25em] text-center
                         border border-[#2a2a2a] px-4 py-4 outline-none rounded-none
                         focus:border-white
                         placeholder:text-[#333] placeholder:tracking-widest transition-colors"
            />
            {error && (
              <p className="text-red-400 text-xs mt-2">{error}</p>
            )}
          </div>

          <button
            onClick={() => handleJoin()}
            disabled={loading || !code}
            className="w-full bg-white hover:bg-[#f0f0f0] disabled:bg-[#1a1a1a] disabled:text-[#555]
                       text-black font-bold text-sm py-3.5 rounded-none
                       transition-colors flex items-center justify-center gap-2"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" />
            ) : (
              'Join Room'
            )}
          </button>

          <p className="text-center text-[#444] text-xs mt-5">
            Scan the QR code at the venue to join automatically
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-[#1a1a1a] px-6 py-4 text-center">
        <p className="text-[#333] text-xs">
          DropTheQueue — Real-time DJ request platform
        </p>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <Suspense>
      <JoinForm />
    </Suspense>
  );
}
