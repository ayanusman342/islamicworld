export const REEL_CATEGORIES = [
  "General",
  "Quran Recitation",
  "Nasheed",
  "Reminder",
  "Seerah",
  "Dua",
  "Lecture",
] as const;

export type ReelDTO = {
  id: string;
  title: string;
  description: string | null;
  category: string;
  videoUrl: string;
  thumbnailUrl: string | null;
  durationSeconds: number | null;
  status: string;
  views: number;
  createdAt: string;
  authorName: string | null;
  likes: number;
  likedByMe: boolean;
};
