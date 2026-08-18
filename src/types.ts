export type MediaType = 'image' | 'video';

export type TimerDurationKey = '10s' | '1m' | '1d' | '2d' | '4d' | '6d';

export interface SideData {
  id: string;
  name: string;
  description: string;
  mediaType: MediaType;
  mediaUrl: string;
  votes: number;
}

export interface Matchup {
  id: string;
  title: string;
  category: string;
  sideA: SideData;
  sideB: SideData;
  timerDuration: TimerDurationKey;
  timerEndsAt: number | null; // Milliseconds timestamp
  status: 'active' | 'expired';
  userVotedSide?: 'sideA' | 'sideB' | null;
}

export interface TimerOption {
  key: TimerDurationKey;
  label: string;
  durationMs: number;
}
