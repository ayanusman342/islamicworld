import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import type { ReelDTO } from "@/data/reels";


export function createPublicClient() {
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"]!;
  return createClient<Database>(process.env["SUPABASE_URL"]!, key, {
    auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
    global: {
      fetch: (input, init) => {
        const h = new Headers(init?.headers);
        if (key.startsWith("sb_") && h.get("Authorization") === `Bearer ${key}`) {
          h.delete("Authorization");
        }
        h.set("apikey", key);
        return fetch(input, { ...init, headers: h });
      },
    },
  });
}

const SIGNED_URL_TTL = 60 * 60 * 4;

function isRemote(value: string) {
  return value.startsWith("http://") || value.startsWith("https://");
}

/** Turns storage object paths into short-lived signed URLs; leaves absolute URLs alone. */
export async function resolveMediaUrls(paths: (string | null)[]): Promise<Map<string, string>> {
  const map = new Map<string, string>();
  const storagePaths = [
    ...new Set(paths.filter((p): p is string => Boolean(p) && !isRemote(p!))),
  ];
  if (storagePaths.length === 0) return map;

  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data } = await supabaseAdmin.storage
    .from("reels")
    .createSignedUrls(storagePaths, SIGNED_URL_TTL);

  for (const item of data ?? []) {
    if (item.path && item.signedUrl) map.set(item.path, item.signedUrl);
  }
  return map;
}

type ReelRow = Database["public"]["Tables"]["reels"]["Row"];

export async function toReelDTOs(
  client: SupabaseClient<Database>,
  rows: ReelRow[],
  viewerId: string | null,
): Promise<ReelDTO[]> {
  if (rows.length === 0) return [];

  const ids = rows.map((r) => r.id);
  const [{ data: likes }, { data: profiles }, media] = await Promise.all([
    client.from("reel_likes").select("reel_id, user_id").in("reel_id", ids),
    client
      .from("profiles")
      .select("id, display_name")
      .in("id", [...new Set(rows.map((r) => r.user_id))]),
    resolveMediaUrls([...rows.map((r) => r.video_url), ...rows.map((r) => r.thumbnail_url)]),
  ]);

  const nameById = new Map((profiles ?? []).map((p) => [p.id, p.display_name]));
  const likeCount = new Map<string, number>();
  const likedByMe = new Set<string>();
  for (const like of likes ?? []) {
    likeCount.set(like.reel_id, (likeCount.get(like.reel_id) ?? 0) + 1);
    if (viewerId && like.user_id === viewerId) likedByMe.add(like.reel_id);
  }

  return rows.map((r) => ({
    id: r.id,
    title: r.title,
    description: r.description,
    category: r.category,
    videoUrl: isRemote(r.video_url) ? r.video_url : (media.get(r.video_url) ?? ""),
    thumbnailUrl: r.thumbnail_url
      ? isRemote(r.thumbnail_url)
        ? r.thumbnail_url
        : (media.get(r.thumbnail_url) ?? null)
      : null,
    durationSeconds: r.duration_seconds,
    status: r.status,
    views: r.views,
    createdAt: r.created_at,
    authorName: nameById.get(r.user_id) ?? null,
    likes: likeCount.get(r.id) ?? 0,
    likedByMe: likedByMe.has(r.id),
  }));
}

export async function assertModerator(context: {
  supabase: SupabaseClient<Database>;
  userId: string;
}) {
  const [admin, moderator] = await Promise.all([
    context.supabase.rpc("has_role", { _user_id: context.userId, _role: "admin" }),
    context.supabase.rpc("has_role", { _user_id: context.userId, _role: "moderator" }),
  ]);
  if (!admin.data && !moderator.data) throw new Error("Forbidden");
}
