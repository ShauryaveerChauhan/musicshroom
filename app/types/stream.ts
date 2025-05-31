export type StreamType = 'YouTube' | 'Spotify';

export interface Stream {
  id: string;
  title: string;
  type: StreamType;
  url: string;
  extractedId: string;
  active: boolean;
  userId: string;
  smallImg: string;
  bigImg: string;
  artist?: string | null;
  album?: string | null;
  durationMs?: number | null;
}

export interface StreamResponse {
  id: string;
  title: string;
  artist: string;
  album: string;
  duration: string;
  durationSeconds: number;
  smallThumbnail: string;
  largeThumbnail: string;
}
