import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Film, Trash2, Upload, ShieldCheck, Eye, Heart } from "lucide-react";
import { REEL_CATEGORIES } from "@/data/reels";
import { createReel, deleteReel, listMyReels } from "@/lib/reels.functions";

export const Route = createFileRoute("/_authenticated/my-reels")({
  head: () => ({
    meta: [
      { title: "My Reels — Upload Islamic Videos | Islamic World" },
      {
        name: "description",
        content:
          "Upload short Islamic videos, track views and likes, and manage the reels you shared with the community.",
      },
      { property: "og:title", content: "My Reels — Islamic World" },
      {
        property: "og:description",
        content: "Upload and manage your Islamic short videos.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: MyReelsPage,
});

const MAX_BYTES = 60 * 1024 * 1024;

function MyReelsPage() {
  const { user } = useAuth();
  const { isAdmin } = useIsAdmin();
  const queryClient = useQueryClient();
  const fileRef = useRef<HTMLInputElement | null>(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<string>("General");
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const fetchMine = useServerFn(listMyReels);
  const create = useServerFn(createReel);
  const remove = useServerFn(deleteReel);

  const mine = useQuery({
    queryKey: ["my-reels", user?.id],
    queryFn: () => fetchMine(),
    enabled: Boolean(user),
  });

  const removeMutation = useMutation({
    mutationFn: (id: string) => remove({ data: { id } }),
    onSuccess: () => {
      toast.success("Reel deleted");
      queryClient.invalidateQueries({ queryKey: ["my-reels"] });
      queryClient.invalidateQueries({ queryKey: ["reels"] });
    },
    onError: () => toast.error("Could not delete that reel"),
  });

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!file) {
      toast.error("Choose a video file first");
      return;
    }
    if (file.size > MAX_BYTES) {
      toast.error("Video must be under 60 MB");
      return;
    }
    setUploading(true);
    try {
      const ext = file.name.split(".").pop()?.toLowerCase() ?? "mp4";
      const path = `${user.id}/${crypto.randomUUID()}.${ext}`;
      const { error: upErr } = await supabase.storage.from("reels").upload(path, file, {
        contentType: file.type || "video/mp4",
        upsert: false,
      });
      if (upErr) throw upErr;

      await create({ data: { title, description, category, videoUrl: path } });
      toast.success("Reel published");
      setTitle("");
      setDescription("");
      setFile(null);
      if (fileRef.current) fileRef.current.value = "";
      queryClient.invalidateQueries({ queryKey: ["my-reels"] });
      queryClient.invalidateQueries({ queryKey: ["reels"] });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="text-xs uppercase tracking-widest gold-text">Share Khayr</div>
          <h1 className="font-display text-4xl md:text-5xl mt-1">My Reels</h1>
          <p className="text-muted-foreground mt-2">
            Upload beneficial short videos. Reels appear in the public feed right away.
          </p>
        </div>
        <div className="flex gap-2">
          {isAdmin && (
            <Button asChild variant="outline" className="rounded-full gap-2">
              <Link to="/reels-review">
                <ShieldCheck className="h-4 w-4" />
                Review queue
              </Link>
            </Button>
          )}
          <Button asChild variant="secondary" className="rounded-full gap-2">
            <Link to="/reels">
              <Film className="h-4 w-4" />
              Feed
            </Link>
          </Button>
        </div>
      </header>

      <div className="ornate-divider mb-6" />

      <Card className="mb-8">
        <CardContent className="pt-6">
          <form onSubmit={onSubmit} className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="reel-title">Title</Label>
              <Input
                id="reel-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={120}
                required
                placeholder="Surah Ar-Rahman — beautiful recitation"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="reel-desc">Description</Label>
              <Textarea
                id="reel-desc"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                maxLength={1000}
                rows={3}
                placeholder="Add context, reciter name or a reference."
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label>Category</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {REEL_CATEGORIES.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="reel-file">Video (max 60 MB)</Label>
                <Input
                  id="reel-file"
                  ref={fileRef}
                  type="file"
                  accept="video/*"
                  onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                  required
                />
              </div>
            </div>
            <Button type="submit" disabled={uploading} className="rounded-full gap-2 w-fit">
              <Upload className="h-4 w-4" />
              {uploading ? "Uploading…" : "Upload reel"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <h2 className="font-display text-2xl mb-3">Your uploads</h2>
      {mine.isPending ? (
        <div className="grid gap-3">
          <Skeleton className="h-20 rounded-xl" />
          <Skeleton className="h-20 rounded-xl" />
        </div>
      ) : (mine.data ?? []).length === 0 ? (
        <p className="text-muted-foreground">You haven't uploaded any reels yet.</p>
      ) : (
        <div className="grid gap-3">
          {(mine.data ?? []).map((reel) => (
            <Card key={reel.id}>
              <CardContent className="py-4 flex items-center gap-4">
                <div className="h-16 w-12 shrink-0 rounded-lg bg-primary/10 grid place-items-center overflow-hidden">
                  {reel.thumbnailUrl ? (
                    <img
                      src={reel.thumbnailUrl}
                      alt={reel.title}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <Film className="h-5 w-5 text-primary" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium truncate">{reel.title}</span>
                    <Badge
                      variant={
                        reel.status === "approved"
                          ? "default"
                          : reel.status === "rejected"
                            ? "destructive"
                            : "secondary"
                      }
                    >
                      {reel.status}
                    </Badge>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1 flex items-center gap-3">
                    <span>{reel.category}</span>
                    <span className="inline-flex items-center gap-1">
                      <Eye className="h-3 w-3" /> {reel.views}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Heart className="h-3 w-3" /> {reel.likes}
                    </span>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Delete reel"
                  onClick={() => removeMutation.mutate(reel.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
