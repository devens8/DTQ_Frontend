import { create } from 'zustand';
import type { Room, NowPlayingTrack, SongRequest, User } from '@/types';

interface RoomStore {
  room: Room | null;
  nowPlaying: NowPlayingTrack | null;
  queue: SongRequest[];
  user: User | null;
  token: string | null;
  userVotes: Set<string>;
  userActiveRequests: number;
  cooldownEndsAt: Date | null;
  isRequestModalOpen: boolean;
  celebrationTrack: SongRequest | null;
  isConnected: boolean;

  setRoom: (room: Room) => void;
  setNowPlaying: (track: NowPlayingTrack) => void;
  updateQueue: (queue: SongRequest[]) => void;
  addVote: (requestId: string) => void;
  removeVote: (requestId: string) => void;
  openRequestModal: () => void;
  closeRequestModal: () => void;
  triggerCelebration: (track: SongRequest) => void;
  dismissCelebration: () => void;
  setConnected: (v: boolean) => void;
  setUser: (user: User, token: string) => void;
  setCooldown: (endsAt: Date | null) => void;
  setActiveRequests: (count: number) => void;
}

export const useRoomStore = create<RoomStore>((set, get) => ({
  room: null,
  nowPlaying: null,
  queue: [],
  user: null,
  token: null,
  userVotes: new Set(),
  userActiveRequests: 0,
  cooldownEndsAt: null,
  isRequestModalOpen: false,
  celebrationTrack: null,
  isConnected: false,

  setRoom: (room) => set({ room }),
  setNowPlaying: (track) => set({ nowPlaying: track }),
  updateQueue: (queue) => {
    const { userVotes } = get();
    const updatedQueue = queue.map(req => ({
      ...req,
      userHasVoted: userVotes.has(req.id),
    }));
    set({ queue: updatedQueue });
  },
  addVote: (requestId) => set(state => {
    const newVotes = new Set(state.userVotes);
    newVotes.add(requestId);
    const updatedQueue = state.queue.map(req =>
      req.id === requestId
        ? { ...req, userHasVoted: true, voteCount: req.voteCount + 1 }
        : req
    );
    return { userVotes: newVotes, queue: updatedQueue };
  }),
  removeVote: (requestId) => set(state => {
    const newVotes = new Set(state.userVotes);
    newVotes.delete(requestId);
    const updatedQueue = state.queue.map(req =>
      req.id === requestId
        ? { ...req, userHasVoted: false, voteCount: Math.max(0, req.voteCount - 1) }
        : req
    );
    return { userVotes: newVotes, queue: updatedQueue };
  }),
  openRequestModal: () => set({ isRequestModalOpen: true }),
  closeRequestModal: () => set({ isRequestModalOpen: false }),
  triggerCelebration: (track) => set({ celebrationTrack: track }),
  dismissCelebration: () => set({ celebrationTrack: null }),
  setConnected: (v) => set({ isConnected: v }),
  setUser: (user, token) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('dtq_token', token);
      localStorage.setItem('dtq_user', JSON.stringify(user));
    }
    set({ user, token });
  },
  setCooldown: (endsAt) => set({ cooldownEndsAt: endsAt }),
  setActiveRequests: (count) => set({ userActiveRequests: count }),
}));