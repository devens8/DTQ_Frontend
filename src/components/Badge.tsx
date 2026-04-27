'use client';

const BADGE_META: Record<string, { icon: string; label: string; description: string }> = {
  taste_maker: { icon: '🏆', label: 'Taste Maker', description: 'First accepted request' },
  crowd_favorite: { icon: '🔥', label: 'Crowd Favorite', description: '3+ songs accepted' },
  on_fire: { icon: '⚡', label: 'On Fire', description: '2+ consecutive accepts' },
};

interface Props {
  badge: string;
}

export default function Badge({ badge }: Props) {
  const meta = BADGE_META[badge] || { icon: '🎵', label: badge, description: '' };
  return (
    <div className="flex items-center gap-2 bg-[#1a1a2e] rounded-xl px-3 py-2 border border-white/5">
      <span className="text-xl">{meta.icon}</span>
      <div>
        <p className="text-sm font-bold text-white">{meta.label}</p>
        {meta.description && <p className="text-xs text-gray-500">{meta.description}</p>}
      </div>
    </div>
  );
}
