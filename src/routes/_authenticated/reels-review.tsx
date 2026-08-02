import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { toast } from "sonner";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Check, X, Film, ShieldOff, Clock } from "lucide-react";
import { listReelsForReview, setReelStatus, deleteReel } from "@/lib/reels.functions";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/reels-review")({
  head: () => ({
    meta: [
      { title: "Reels Review Queue — Islamic World" },
      {
        name: "description",
        content:
          "Moderate community Islamic reels: approve, reject or remove submitted short videos.",
      },
      { property: "og:title", content: "Reels Review Queue — Islamic World" },
      {
        property: "og:description",
        content: "Approve or reject submitted Islamic reels.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ReelsReviewPage,
});

const FILTERS = ["pending", "approved", "rejected", "all"] as const;

function ReelsReviewPage() {
  const { isAdmin, checking } = useIsAdmin();
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("pending");

  const fetchAll = useServerFn(listReelsForReview);
  const setStatus = useServerFn(setReelStatus);
  const remove = useServerFn(deleteReel);

  const reviewQuery = useQuery({
    queryKey: ["reels-review"],
    queryFn: () => fetchAll(),
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["reels-review"] });
    queryClient.invalidateQueries({ queryKey: ["reels"] });
  };

  const statusMutation = useMutation({
    mutationFn: (vars: { id: string; status: "approved" | "rejected" | "pending" }) =>
      setStatus({ data: vars }),
    onSuccess: (_d, vars) => {
      toast.success(`Reel ${vars.status}`);
      invalidate();
    },
    onError: () => toast.error("Action failed"),
  });

  const removeMutation = useMutation({
    mutationFn: (id: string) => remove({ data: { id } }),
    onSuccess: () => {
      toast.success("Reel removed");
      invalidate();
    },
    onError: () => toast.error("Could not remove reel"),
  });

  if (!checking && !isAdmin && reviewQuery.isError) {
    return (
      <div className="mx-auto max-w-xl px-4 py-20 text-center">
        <ShieldOff className="h-8 w-8 mx-auto text-muted-foreground" />
        <h1 className="font-display text-3xl mt-3">Access denied</h1>
        <p className="text-muted-foreground mt-1">
          Only admins and moderators can review reels.
        </p>
        <Button asChild variant="outline" className="rounded-full mt-4">
          <Link to="/reels">Back to feed</Link>
        </Button>
      </div>
    );
  }

  const rows = (reviewQuery.data ?? []).filter((r) =>
    filter === "all" ? true : r.status === filter,
  );

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <header className="mb-6">
        <div className="text-xs uppercase tracking-widest gold-text">Moderation</div>
        <h1 className="font-display text-4xl mt-1">Reels Review</h1>
        <p className="text-muted-foreground mt-2">
          Approve reels to publish them in the public feed.
        </p>
      </header>

      <div className="ornate-divider mb-6" />

      <div className="flex gap-2 mb-6">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              "rounded-full px-4 h-9 text-sm border capitalize transition-colors",
              filter === f
                ? "bg-primary text-primary-foreground border-transparent"
                : "text-muted-foreground hover:text-foreground hover:bg-accent",
            )}
          >
            {f}
          </button>
        ))}
      </div>

      {reviewQuery.isPending ? (
        <div className="grid gap-3">
          <Skeleton className="h-24 rounded-xl" />
          <Skeleton className="h-24 rounded-xl" />
        </div>
      ) : rows.length === 0 ? (
        <div className="glass rounded-2xl p-10 text-center">
          <Clock className="h-7 w-7 mx-auto text-muted-foreground" />
          <p className="mt-2 text-muted-foreground">Nothing in this list right now.</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {rows.map((reel) => (
            <Card key={reel.id}>
              <CardContent className="pt-6 grid gap-3">
                <div className="aspect-video rounded-xl overflow-hidden bg-primary/10 grid place-items-center">
                  {reel.videoUrl ? (
                    <video
                      src={reel.videoUrl}
                      controls
                      preload="metadata"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <Film className="h-6 w-6 text-primary" />
                  )}
                </div>
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
                {reel.description && (
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {reel.description}
                  </p>
                )}
                <p className="text-xs text-muted-foreground">
                  {reel.category} · {reel.authorName ?? "Unknown member"} ·{" "}
                  {new Date(reel.createdAt).toLocaleDateString()}
                </p>
                <div className="flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    className="rounded-full gap-1.5"
                    disabled={reel.status === "approved"}
                    onClick={() => statusMutation.mutate({ id: reel.id, status: "approved" })}
                  >
                    <Check className="h-4 w-4" />
                    Approve
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="rounded-full gap-1.5"
                    disabled={reel.status === "rejected"}
                    onClick={() => statusMutation.mutate({ id: reel.id, status: "rejected" })}
                  >
                    <X className="h-4 w-4" />
                    Reject
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="rounded-full"
                    onClick={() => removeMutation.mutate(reel.id)}
                  >
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
