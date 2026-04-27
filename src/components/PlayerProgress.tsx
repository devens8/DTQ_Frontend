'use client';

function formatTime(ms: number): string {
  const secs = Math.floor(ms / 1000);
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

interface Props {
  progressMs: number;
  durationMs: number;
}

export default function PlayerProgress({ progressMs, durationMs }: Props) {
  const pct = durationMs > 0 ? Math.min((progressMs / durationMs) * 100, 100) : 0;

  return (
    <div className="flex items-center gap-2">
      <span className="text-[10px] font-mono text-[#555] w-8 text-right tabular">{formatTime(progressMs)}</span>
      <div className="flex-1 h-px bg-[#1a1a1a]">
        <div
          className="h-px bg-white transition-all duration-1000 ease-linear"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-[10px] font-mono text-[#555] w-8 tabular">{formatTime(durationMs)}</span>
    </div>
  );
}
