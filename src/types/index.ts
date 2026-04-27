export interface Room {
  id: string;
  name: string;
  code: string;
  status: 'active' | 'paused' | 'closed';
  mode: 'normal' | 'override';
  dj?: { id: string; displayName: string } | null;
}

export interface NowPlayingTrack {
  trackId: string;
  title: string;
  artist: string;
  albumArtUrl: string;
  durationMs: number;
  progressMs: number;
}

export interface SongRequest {
  id: string;
  trackId: string;
  title: string;
  artist: string;
  albumArtUrl: string;
  durationMs: number;
  bpm?: number;
  genre?: string;
  explicit: boolean;
  voteCount: number;
  boostScore: number;
  status: 'pending' | 'accepted' | 'rejected' | 'played' | 'expired';
  priorityTag: null | 'fast_pass' | 'must_play';
  rankingScore: number;
  requesterName?: string;
  requestedAt: string;
  userHasVoted: boolean;
}

export interface User {
  id: string;
  type: 'attendee' | 'dj' | 'venue_owner';
  displayName: string;
  badges: string[];
  totalAccepts: number;
  totalRequests: number;
  avatarSeed: string;
}

export interface MixSuggestion {
  id: string;
  fromTrackId: string;
  fromTitle: string;
  toTrackId: string;
  toTitle: string;
  voteCount: number;
  status: string;
  suggestedAt: string;
}

export interface RoomState {
  room: Room;
  nowPlaying: NowPlayingTrack | null;
  queue: SongRequest[];
  userState: {
    activeRequests: number;
    cooldownEndsAt: string | null;
    canVote: boolean;
  };
}

export interface TrackResult {
  trackId: string;
  source: string;
  title: string;
  artist: string;
  albumArtUrl: string;
  durationMs: number;
  explicit: boolean;
  previewUrl: string | null;
}
