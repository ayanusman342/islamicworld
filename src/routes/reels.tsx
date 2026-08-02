import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Heart, Eye, Volume2, VolumeX, Upload, Film, Play } from "lucide-react";
import { REEL_CATEGORIES, type ReelDTO } from "@/data/reels";
import {
  listReels,
  getMyReelLikes,
  toggleReelLike,
  registerReelView,
} from "@/lib/reels.functions";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/reels")({
  head: () => ({
    meta: [
      { title: "Islamic Reels — Short Videos | Islamic World" },
      {
        name: "description",
        content:
          "Watch short Islamic reels: Quran recitations, nasheeds, reminders and seerah clips shared by the Islamic World community.",
      },
      { property: "og:title", content: "Islamic Reels — Short Videos" },
      {
        property: "og:description",
        content: "Quran recitations, nasheeds and reminders in short vertical videos.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ReelsPage,
});

function ReelsPage() {
  const [category, setCategory] = useState<string>("All");
  const [muted, setMuted] = useState(true);
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const fetchReels = useServerFn(listReels);
  const fetchLikes = useServerFn(getMyReelLikes);
  const like = useServerFn(toggleReelLike);
  const view = useServerFn(registerReelView);

  const reelsQuery = useQuery({
    queryKey: ["reels", category],
    queryFn: () => fetchReels({ data: { category } }),
  });

  const likesQuery = useQuery({
    queryKey: ["reel-likes", user?.id],
    queryFn: () => fetchLikes(),
    enabled: Boolean(user),
  });

  const likedIds = new Set(likesQuery.data ?? []);
  const reels = reelsQuery.data ?? [];

  const onLike = async (reel: ReelDTO) => {
    if (!user) {
      toast.error("Sign in to like reels");
      return;
    }
    try {
      await like({ data: { id: reel.id, liked: likedIds.has(reel.id) } });
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["reel-likes"] }),
        queryClient.invalidateQueries({ queryKey: ["reels"] }),
      ]);
    } catch {
      toast.error("Could not update your like");
    }
  };

  return (
    <AppShell>
      <div className="mx-auto max-w-6xl px-4 py-8">
        <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="text-xs uppercase tracking-widest gold-text">Nur fi Daqiqa</div>
            <h1 className="font-display text-4xl md:text-5xl mt-1">Islamic Reels</h1>
            <p className="text-muted-foreground mt-2 max-w-xl">
              Short vertical videos — recitations, nasheeds and reminders. Swipe or scroll
              through the feed.
            </p>
          </div>
          <Button asChild className="rounded-full gap-2">
            <Link to="/my-reels">
              <Upload className="h-4 w-4" />
              Upload a reel
            </Link>
          </Button>
        </header>

        <div className="ornate-divider mb-6" />

        <div className="flex gap-2 overflow-x-auto pb-4">
          {["All", ...REEL_CATEGORIES].map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={cn(
                "shrink-0 rounded-full px-4 h-9 text-sm border transition-colors",
                category === c
                  ? "bg-primary text-primary-foreground border-transparent"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent",
              )}
            >
              {c}
            </button>
          ))}
        </div>

        {reelsQuery.isPending ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <Skeleton key={i} className="aspect-[9/16] rounded-2xl" />
            ))}
          </div>
        ) : reels.length === 0 ? (
          <div className="glass rounded-2xl p-10 text-center">
            <Film className="h-8 w-8 mx-auto text-muted-foreground" />
            <h2 className="font-display text-2xl mt-3">No reels yet</h2>
            <p className="text-muted-foreground mt-1">
              Be the first to share a beneficial short video with the community.
            </p>
            <Button asChild className="rounded-full mt-4">
              <Link to="/my-reels">Upload a reel</Link>
            </Button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-6 md:grid md:grid-cols-2 lg:grid-cols-3 md:items-stretch">
            {reels.map((reel) => (
              <ReelCard
                key={reel.id}
                reel={reel}
                muted={muted}
                onToggleMute={() => setMuted((m) => !m)}
                liked={likedIds.has(reel.id)}
                onLike={() => onLike(reel)}
                onView={() => view({ data: { id: reel.id } }).catch(() => {})}
              />
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}

function ReelCard({
  reel,
  muted,
  onToggleMute,
  liked,
  onLike,
  onView,
}: {
  reel: ReelDTO;
  muted: boolean;
  onToggleMute: () => void;
  liked: boolean;
  onLike: () => void;
  onView: () => void;
}) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const counted = useRef(false);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry) return;
        if (entry.isIntersecting && entry.intersectionRatio > 0.6) {
          el.play()
            .then(() => setPlaying(true))
            .catch(() => setPlaying(false));
          if (!counted.current) {
            counted.current = true;
            onView();
          }
        } else {
          el.pause();
          setPlaying(false);
        }
      },
      { threshold: [0, 0.6, 1] },
    );
    observer.observe(el);
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const togglePlay = () => {
    const el = videoRef.current;
    if (!el) return;
    if (el.paused) {
      el.play()
        .then(() => setPlaying(true))
        .catch(() => setPlaying(false));
    } else {
      el.pause();
      setPlaying(false);
    }
  };

  return (
    <article className="relative w-full max-w-sm aspect-[9/16] overflow-hidden rounded-2xl bg-primary/90 shadow-elegant">
      <video
        ref={videoRef}
        src={reel.videoUrl}
        poster={reel.thumbnailUrl ?? undefined}
        muted={muted}
        loop
        playsInline
        preload="metadata"
        onClick={togglePlay}
        className="absolute inset-0 h-full w-full object-cover cursor-pointer"
      />

      {!playing && (
        <button
          onClick={togglePlay}
          aria-label="Play reel"
          className="absolute inset-0 grid place-items-center"
        >
          <span className="h-14 w-14 rounded-full glass grid place-items-center">
            <Play className="h-6 w-6 text-gold" />
          </span>
        </button>
      )}

      <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/75 to-transparent">
        <Badge variant="secondary" className="mb-2">
          {reel.category}
        </Badge>
        <h2 className="font-display text-xl text-white leading-tight">{reel.title}</h2>
        {reel.description && (
          <p className="text-white/80 text-sm mt-1 line-clamp-2">{reel.description}</p>
        )}
        <p className="text-white/60 text-xs mt-2">
          {reel.authorName ? `by ${reel.authorName}` : "by a community member"}
        </p>
      </div>

      <div className="absolute right-3 bottom-28 flex flex-col items-center gap-3">
        <button
          onClick={onLike}
          aria-label={liked ? "Unlike reel" : "Like reel"}
          className="flex flex-col items-center gap-1 text-white"
        >
          <span className="h-10 w-10 rounded-full glass grid place-items-center">
            <Heart className={cn("h-5 w-5", liked && "fill-current text-gold")} />
          </span>
          <span className="text-[11px]">{reel.likes}</span>
        </button>
        <div className="flex flex-col items-center gap-1 text-white">
          <span className="h-10 w-10 rounded-full glass grid place-items-center">
            <Eye className="h-5 w-5" />
          </span>
          <span className="text-[11px]">{reel.views}</span>
        </div>
        <button
          onClick={onToggleMute}
          aria-label={muted ? "Unmute" : "Mute"}
          className="h-10 w-10 rounded-full glass grid place-items-center text-white"
        >
          {muted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
        </button>
      </div>
    </article>
  );
}
