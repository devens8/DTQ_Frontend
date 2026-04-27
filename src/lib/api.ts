import axios from 'axios';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

const client = axios.create({ baseURL: BASE_URL });

client.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('dtq_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

client.interceptors.response.use(
  (res) => res.data,
  (err) => Promise.reject(err),
);

export const api = {
  rooms: {
    getByCode: (code: string) => client.get(`/rooms/${code}`),
    getById: (id: string) => client.get(`/rooms/${id}`),
    create: (data: any) => client.post('/rooms', data),
    setMode: (id: string, mode: string) => client.patch(`/rooms/${id}/mode`, { mode }),
  },
  requests: {
    submit: (roomId: string, trackId: string, source = 'spotify') =>
      client.post(`/rooms/${roomId}/requests`, { trackId, source }),
    getQueue: (roomId: string) => client.get(`/rooms/${roomId}/requests`),
    withdraw: (roomId: string, reqId: string) =>
      client.delete(`/rooms/${roomId}/requests/${reqId}`),
    accept: (roomId: string, reqId: string) =>
      client.post(`/dj/rooms/${roomId}/requests/${reqId}/accept`),
    reject: (roomId: string, reqId: string, reason?: string) =>
      client.post(`/dj/rooms/${roomId}/requests/${reqId}/reject`, { reason }),
  },
  votes: {
    cast: (roomId: string, requestId: string) =>
      client.post(`/rooms/${roomId}/requests/${requestId}/vote`),
    remove: (roomId: string, requestId: string) =>
      client.delete(`/rooms/${roomId}/requests/${requestId}/vote`),
  },
  music: {
    search: (q: string, source = 'spotify', limit = 10) =>
      client.get('/music/search', { params: { q, source, limit } }),
    getTrack: (id: string, source = 'spotify') =>
      client.get(`/music/track/${id}`, { params: { source } }),
  },
  auth: {
    anonymous: (fingerprint: string, displayName?: string) =>
      client.post('/auth/anonymous', { fingerprint, displayName }),
    me: () => client.get('/auth/me'),
  },
  payments: {
    createBoostIntent: (data: { roomId: string; requestId: string; boostType: string }) =>
      client.post('/payments/boost', data),
  },
  mixSuggestions: {
    submit: (roomId: string, data: any) =>
      client.post(`/rooms/${roomId}/mix-suggestions`, data),
    vote: (roomId: string, id: string) =>
      client.post(`/rooms/${roomId}/mix-suggestions/${id}/vote`),
    getForRoom: (roomId: string) =>
      client.get(`/dj/rooms/${roomId}/mix-suggestions`),
  },
  nowPlaying: {
    get: (roomId: string) => client.get(`/rooms/${roomId}/now-playing`),
    set: (roomId: string, data: any) =>
      client.post(`/dj/rooms/${roomId}/now-playing`, data),
  },
  analytics: {
    summary: (roomId: string) => client.get(`/rooms/${roomId}/analytics/summary`),
  },
};
