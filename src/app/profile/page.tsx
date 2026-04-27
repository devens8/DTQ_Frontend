'use client';

import { useAuth } from '@/context/AuthContext';
import { motion } from 'framer-motion';
import Badge from '@/components/Badge';

export default function ProfilePage() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 py-8 max-w-sm mx-auto">
      <a href="/" className="text-gray-500 text-sm hover:text-gray-300 mb-6 block">← Back</a>

      {/* Avatar */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-3xl mx-auto mb-3">
          {user?.displayName?.[0] || '🎵'}
        </div>
        <h1 className="text-xl font-bold text-white">{user?.displayName || 'Anonymous'}</h1>
        <p className="text-gray-500 text-sm">Party Attendee</p>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        {[
          { label: 'Songs Accepted', value: user?.totalAccepts || 0, icon: '🎵' },
          { label: 'Total Requests', value: user?.totalRequests || 0, icon: '📝' },
        ].map(stat => (
          <div key={stat.label} className="bg-[#1a1a2e] rounded-xl p-4 text-center border border-white/5">
            <div className="text-2xl mb-1">{stat.icon}</div>
            <div className="text-2xl font-bold text-white">{stat.value}</div>
            <div className="text-xs text-gray-500">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Badges */}
      {user?.badges && user.badges.length > 0 && (
        <div className="mb-6">
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-3">Badges</h2>
          <div className="space-y-2">
            {user.badges.map(badge => (
              <Badge key={badge} badge={badge} />
            ))}
          </div>
        </div>
      )}

      {user?.badges?.length === 0 && (
        <div className="text-center py-8">
          <div className="text-4xl mb-3">🏆</div>
          <p className="text-gray-500">Request songs and get them accepted to earn badges!</p>
        </div>
      )}
    </div>
  );
}
