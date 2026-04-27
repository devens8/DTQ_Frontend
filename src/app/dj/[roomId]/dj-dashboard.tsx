'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { getSocket } from '@/lib/socket';
import DJRequestCard from '@/components/DJRequestCard';
import type { SongRequest, MixSuggestion } from '@/types';

interface Props { roomId: string }

function StatBox({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="border border-[#1a1a1a] px-4 py-3 flex flex-col gap-1">
      <p className="text-[10px] font-mono text-[#555] uppercase tracking-widest">{label}</p>
      <p className="text-2xl font-bold text-white tabular font-mono leading-none">{value}</p>
      {sub && <p className="text-[10px] font-mono text-[#333]">{sub}</p>}
    </div>
  );
}

export default function DJDashboard({ roomId }: Props) {
  const queryClient = useQueryClient();
  const [filterBpm, setFilterBpm] = useState('all');
  const [isOverride, setIsOverride] = useState(false);
  const [overrideLoading, setOverrideLoading] = useState(false);
  const [connected, setConnected] = useState(true);

  const { data: roomState, isLoading } = useQuery({
    queryKey: ['dj-room', roomId],
    queryFn: () => api.rooms.getById(roomId),
    refetchInterval: 30000,
  });

  const { data: queue = [] } = useQuery({
    queryKey: ['dj-queue', roomId],
    queryFn: () => api.requests.getQueue(roomId),
    refetchInterval: 10000,
  });

  const { data: mixSuggestions = [] } = useQuery({
    queryKey: ['mix-suggestions', roomId],
    queryFn: () => api.mixSuggestions.getForRoom(roomId),
    refetchInterval: 15000,
  });

  const acceptMutation = useMutation({
    mutationFn: (reqId: string) => api.requests.accept(roomId, reqId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['dj-queue', roomId] }),
  });

  const rejectMutation = useMutation({
    mutationFn: ({ reqId, reason }: { reqId: string; reason?: string }) =>
      api.requests.reject(roomId, reqId, reason),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['dj-queue', roomId] }),
  });

  async function toggleOverride() {
    setOverrideLoading(true);
    try {
      const newMode = isOverride ? 'normal' : 'override';
      await api.rooms.setMode(roomId, newMode);
      setIsOverride(!isOverride);
    } finally {
      setOverrideLoading(false);
    }
  }

  // WebSocket
  useEffect(() => {
    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:3001';
    const socket = getSocket(wsUrl);

    socket.emit('dj_join', { roomId });

    socket.on('connect', () => setConnected(true));
    socket.on('disconnect', () => setConnected(false));

    socket.on('queue_update', ({ queue: q }) => {
      queryClient.setQueryData(['dj-queue', roomId], q);
    });

    socket.on('new_request', (req: SongRequest) => {
      queryClient.setQueryData<SongRequest[]>(['dj-queue', roomId], (old = []) => [req, ...old]);
    });

    socket.on('boost_applied', () => {
      queryClient.invalidateQueries({ queryKey: ['dj-queue', roomId] });
    });

    socket.on('new_mix_suggestion', () => {
      queryClient.invalidateQueries({ queryKey: ['mix-suggestions', roomId] });
    });

    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('queue_update');
      socket.off('new_request');
      socket.off('boost_applied');
      socket.off('new_mix_suggestion');
    };
  }, [roomId, queryClient]);

  const filteredQueue = (queue as SongRequest[]).filter(req => {
    if (filterBpm === 'slow' && (req.bpm || 0) > 100) return false;
    if (filterBpm === 'medium' && ((req.bpm || 0) < 100 || (req.bpm || 0) > 140)) return false;
    if (filterBpm === 'fast' && (req.bpm || 0) < 140) return false;
    return true;
  });

  const totalVotes = filteredQueue.reduce((s, r) => s + r.voteCount, 0);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <div className="w-5 h-5 border border-[#333] border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className={`sticky top-0 z-20 bg-black border-b ${isOverride ? 'border-red-900/60' : 'border-[#1a1a1a]'}`}>
        <div className="flex items-center justify-between px-4 py-3 max-w-5xl mx-auto">
          {/* Left: status */}
          <div className="flex items-center gap-3">
            <div className={`w-1.5 h-1.5 rounded-full ${connected ? (isOverride ? 'bg-red-500 animate-pulse' : 'bg-white') : 'bg-red-500 animate-pulse'}`} />
            <div>
              <p className="text-[10px] font-mono text-[#555] uppercase tracking-widest">
                {isOverride ? 'OVERRIDE ACTIVE' : connected ? 'LIVE' : 'DISCONNECTED'}
              </p>
              <p className="text-xs font-mono text-[#333] tabular">{roomId.slice(0, 8).toUpperCase()}</p>
            </div>
          </div>

          {/* Right: controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={toggleOverride}
              disabled={overrideLoading}
              className={`px-3 py-1.5 text-[11px] font-mono font-bold uppercase tracking-wider transition-colors disabled:opacity-50 ${
                isOverride
                  ? 'bg-red-700 hover:bg-red-600 text-white'
                  : 'border border-[#2a2a2a] text-[#888] hover:border-white hover:text-white'
              }`}
            >
              {overrideLoading ? '...' : isOverride ? 'Resume Requests' : 'Override'}
            </button>
            <button className="px-3 py-1.5 text-[11px] font-mono uppercase tracking-wider border border-[#2a2a2a] text-[#555] hover:border-[#555] transition-colors">
              End Session
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-5 space-y-5">
        {/* Stats row */}
        <div className="grid grid-cols-4 gap-2">
          <StatBox label="In Queue" value={filteredQueue.length} />
          <StatBox label="Total Votes" value={totalVotes} />
          <StatBox label="Mix Ideas" value={(mixSuggestions as MixSuggestion[]).length} />
          <StatBox
            label="Mode"
            value={isOverride ? 'OVERRIDE' : 'OPEN'}
            sub={isOverride ? 'Requests paused' : 'Accepting requests'}
          />
        </div>

        {/* Main content: two column on larger screens */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Queue panel */}
          <div className="lg:col-span-2 border border-[#1a1a1a]">
            {/* Panel header */}
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-[#1a1a1a] bg-[#0a0a0a]">
              <div className="flex items-center gap-4">
                <span className="text-[10px] font-mono text-[#555] uppercase tracking-widest">
                  Requests
                </span>
                <span className="text-[10px] font-mono text-[#333] tabular">
                  {filteredQueue.length} pending
                </span>
              </div>

              {/* BPM filters */}
              <div className="flex items-center gap-1">
                {[
                  { label: 'All', value: 'all' },
                  { label: '<100', value: 'slow' },
                  { label: '100–140', value: 'medium' },
                  { label: '140+', value: 'fast' },
                ].map(f => (
                  <button
                    key={f.value}
                    onClick={() => setFilterBpm(f.value)}
                    className={`px-2 py-1 text-[10px] font-mono uppercase tracking-wider transition-colors ${
                      filterBpm === f.value
                        ? 'bg-white text-black'
                        : 'text-[#555] hover:text-white'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Column headers */}
            <div className="grid grid-cols-[48px_1fr_60px] border-b border-[#1a1a1a] bg-[#050505]">
              <div className="px-2 py-1.5" />
              <div className="px-3 py-1.5 text-[9px] font-mono text-[#333] uppercase tracking-widest">
                Track
              </div>
              <div className="px-2 py-1.5 text-[9px] font-mono text-[#333] uppercase tracking-widest text-right border-l border-[#1a1a1a]">
                Action
              </div>
            </div>

            {/* Requests */}
            {filteredQueue.length === 0 ? (
              <div className="px-4 py-12 text-center">
                <p className="text-[#444] text-xs font-mono">No pending requests</p>
              </div>
            ) : (
              <div>
                {filteredQueue.map((req, index) => (
                  <DJRequestCard
                    key={req.id}
                    request={req}
                    isTopRequest={index === 0}
                    onAccept={() => acceptMutation.mutate(req.id)}
                    onReject={() => rejectMutation.mutate({ reqId: req.id })}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Right column */}
          <div className="space-y-4">
            {/* Mix suggestions */}
            <div className="border border-[#1a1a1a]">
              <div className="px-4 py-2.5 border-b border-[#1a1a1a] bg-[#0a0a0a]">
                <span className="text-[10px] font-mono text-[#555] uppercase tracking-widest">Mix Suggestions</span>
              </div>

              {(mixSuggestions as MixSuggestion[]).length === 0 ? (
                <div className="px-4 py-6 text-center">
                  <p className="text-[10px] font-mono text-[#333]">None yet</p>
                </div>
              ) : (
                <div>
                  {(mixSuggestions as MixSuggestion[]).slice(0, 5).map((mix, i) => (
                    <div key={mix.id} className="flex items-center justify-between px-4 py-3 border-b border-[#1a1a1a] last:border-0">
                      <div className="flex-1 min-w-0 mr-3">
                        <p className="text-xs text-[#888] truncate">
                          <span className="text-white">{mix.fromTitle}</span>
                          <span className="text-[#333] mx-1">→</span>
                          <span className="text-white">{mix.toTitle}</span>
                        </p>
                        <p className="text-[10px] font-mono text-[#333] mt-0.5 tabular">{mix.voteCount}v</p>
                      </div>
                      <button className="text-[10px] font-mono text-[#555] border border-[#2a2a2a] px-2 py-1 hover:border-white hover:text-white transition-colors flex-shrink-0">
                        Use
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Session info */}
            <div className="border border-[#1a1a1a]">
              <div className="px-4 py-2.5 border-b border-[#1a1a1a] bg-[#0a0a0a]">
                <span className="text-[10px] font-mono text-[#555] uppercase tracking-widest">Session</span>
              </div>
              <div className="px-4 py-3 space-y-2">
                <div className="flex justify-between">
                  <span className="text-[10px] font-mono text-[#444]">Room ID</span>
                  <span className="text-[10px] font-mono text-[#888] tabular">{roomId.slice(0, 8).toUpperCase()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[10px] font-mono text-[#444]">WS Status</span>
                  <span className={`text-[10px] font-mono tabular ${connected ? 'text-white' : 'text-red-500'}`}>
                    {connected ? 'CONNECTED' : 'DISCONNECTED'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[10px] font-mono text-[#444]">Mode</span>
                  <span className={`text-[10px] font-mono tabular ${isOverride ? 'text-red-400' : 'text-[#888]'}`}>
                    {isOverride ? 'OVERRIDE' : 'OPEN'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
