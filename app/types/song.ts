export interface Song {
  id: string;
  title: string;
  artist: string;
  album: string;
  duration: string;
  thumbnail: string;
  upvotes: number;
  hasUserUpvoted: boolean;
  addedBy: string;
  youtubeId: string;
  durationSeconds: number;
}
