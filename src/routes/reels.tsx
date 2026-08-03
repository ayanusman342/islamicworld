import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Heart,
  Eye,
  Volume2,
  VolumeX,
  Upload,
  Film,
  Play,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
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
          "Watch short Islamic reels full screen: Quran recitations, nasheeds, reminders and seerah clips shared by the Islamic World community.",
      },
      { property: "og:title", content: "Islamic Reels — Short Videos" },
      {
        property: "og:description",
        content: "Quran recitations, nasheeds and reminders in full-screen vertical videos.",
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

  const containerRef = useRef<HTMLDivElement | null>(null);

  const scrollBy = (dir: 1 | -1) => {
    const el = containerRef.current;
    if (!el) return;
    el.scrollBy({ top: dir * el.clientHeight, behavior: "smooth" });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black">
      {/* Top bar */}
      <div className="absolute top-0 inset-x-0 z-20 bg-gradient-to-b from-black/80 to-transparent">
        <div className="flex items-center gap-2 px-4 h-14">
          <Button
            asChild
            variant="ghost"
            size="icon"
            className="rounded-full text-white hover:bg-white/10"
            aria-label="Close reels"
          >
            <Link to="/">
              <X className="h-5 w-5" />
            </Link>
          </Button>
          <span className="font-display text-lg text-white">Reels</span>
          <div className="ml-auto flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMuted((m) => !m)}
              aria-label={muted ? "Unmute" : "Mute"}
              className="rounded-full text-white hover:bg-white/10"
            >
              {muted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
            </Button>
            <Button asChild size="sm" className="rounded-full gap-1.5">
              <Link to="/profile">
                <Upload className="h-4 w-4" />
                <span className="hidden sm:inline">Upload</span>
              </Link>
            </Button>
          </div>
        </div>
        <div className="flex gap-2 overflow-x-auto px-4 pb-3 no-scrollbar">
          {["All", ...REEL_CATEGORIES].map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={cn(
                "shrink-0 rounded-full px-3 h-7 text-xs border transition-colors",
                category === c
                  ? "bg-white text-black border-transparent"
                  : "text-white/80 border-white/25 hover:bg-white/10",
              )}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Desktop arrows */}
      <div className="hidden md:flex flex-col gap-2 absolute right-4 top-1/2 -translate-y-1/2 z-20">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => scrollBy(-1)}
          aria-label="Previous reel"
          className="rounded-full text-white hover:bg-white/10"
        >
          <ChevronLeft className="h-5 w-5 rotate-90" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => scrollBy(1)}
          aria-label="Next reel"
          className="rounded-full text-white hover:bg-white/10"
        >
          <ChevronRight className="h-5 w-5 rotate-90" />
        </Button>
      </div>

      {reelsQuery.isPending ? (
        <div className="h-full grid place-items-center text-white/70">Loading reels…</div>
      ) : reels.length === 0 ? (
        <div className="h-full grid place-items-center px-6">
          <div className="text-center">
            <Film className="h-8 w-8 mx-auto text-white/60" />
            <h2 className="font-display text-2xl mt-3 text-white">No reels yet</h2>
            <p className="text-white/70 mt-1">
              Be the first to share a beneficial short video with the community.
            </p>
            <Button asChild className="rounded-full mt-4">
              <Link to="/profile">Upload a reel</Link>
            </Button>
          </div>
        </div>
      ) : (
        <div
          ref={containerRef}
          className="h-full overflow-y-auto snap-y snap-mandatory no-scrollbar"
        >
          {reels.map((reel) => (
            <section
              key={reel.id}
              className="h-full w-full snap-start snap-always flex items-center justify-center"
            >
              <ReelCard
                reel={reel}
                muted={muted}
                liked={likedIds.has(reel.id)}
                onLike={() => onLike(reel)}
                onView={() => view({ data: { id: reel.id } }).catch(() => {})}
              />
            </section>
          ))}
        </div>
      )}
    </div>
  );
}

function ReelCard({
  reel,
  muted,
  liked,
  onLike,
  onView,
}: {
  reel: ReelDTO;
  muted: boolean;
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
    <article className="relative h-full w-full md:h-[92%] md:aspect-[9/16] md:w-auto md:rounded-2xl overflow-hidden bg-black">
      <video
        ref={videoRef}
        src={reel.videoUrl}
        poster={reel.thumbnailUrl ?? undefined}
        muted={muted}
        loop
        playsInline
        preload="metadata"
        onClick={togglePlay}
        className="absolute inset-0 h-full w-full object-contain md:object-cover cursor-pointer"
      />

      {!playing && (
        <button
          onClick={togglePlay}
          aria-label="Play reel"
          className="absolute inset-0 grid place-items-center"
        >
          <span className="h-16 w-16 rounded-full glass grid place-items-center">
            <Play className="h-7 w-7 text-gold" />
          </span>
        </button>
      )}

      <div className="absolute inset-x-0 bottom-0 p-5 pr-20 bg-gradient-to-t from-black/80 to-transparent">
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

      <div className="absolute right-3 bottom-32 flex flex-col items-center gap-4">
        <button
          onClick={onLike}
          aria-label={liked ? "Unlike reel" : "Like reel"}
          className="flex flex-col items-center gap-1 text-white"
        >
          <span className="h-11 w-11 rounded-full glass grid place-items-center">
            <Heart className={cn("h-5 w-5", liked && "fill-current text-gold")} />
          </span>
          <span className="text-[11px]">{reel.likes}</span>
        </button>
        <div className="flex flex-col items-center gap-1 text-white">
          <span className="h-11 w-11 rounded-full glass grid place-items-center">
            <Eye className="h-5 w-5" />
          </span>
          <span className="text-[11px]">{reel.views}</span>
        </div>
      </div>
    </article>
  );
}
