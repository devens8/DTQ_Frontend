'use client';

import { useState } from 'react';
import { api } from '@/lib/api';
import { useRoomStore } from '@/store/roomStore';

export function useVote(roomId: string) {
  const [voting, setVoting] = useState<Set<string>>(new Set());
  const { addVote, removeVote, userVotes } = useRoomStore();

  async function vote(requestId: string) {
    if (voting.has(requestId)) return;
    const alreadyVoted = userVotes.has(requestId);

    // Optimistic update
    if (alreadyVoted) {
      removeVote(requestId);
    } else {
      addVote(requestId);
    }

    setVoting(prev => new Set(prev).add(requestId));

    try {
      if (alreadyVoted) {
        await api.votes.remove(roomId, requestId);
      } else {
        await api.votes.cast(roomId, requestId);
      }
    } catch {
      // Revert optimistic update
      if (alreadyVoted) {
        addVote(requestId);
      } else {
        removeVote(requestId);
      }
    } finally {
      setVoting(prev => {
        const s = new Set(prev);
        s.delete(requestId);
        return s;
      });
    }
  }

  return { vote, voting };
}
