import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import {
  assertModerator,
  createPublicClient,
  toReelDTOs,
} from "@/lib/reels.server";

export const listReels = createServerFn({ method: "GET" })
  .inputValidator((input: { category?: string } | undefined) => input ?? {})
  .handler(async ({ data }) => {
    const client = createPublicClient();
    let query = client
      .from("reels")
      .select("*")
      .eq("status", "approved")
      .order("created_at", { ascending: false })
      .limit(50);
    if (data.category && data.category !== "All") query = query.eq("category", data.category);
    const { data: rows, error } = await query;
    if (error) throw new Error(error.message);
    return toReelDTOs(client, rows ?? [], null);
  });

export const listMyReels = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data: rows, error } = await context.supabase
      .from("reels")
      .select("*")
      .eq("user_id", context.userId)
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return toReelDTOs(context.supabase, rows ?? [], context.userId);
  });

export const createReel = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (input: {
      title: string;
      description?: string;
      category: string;
      videoUrl: string;
      durationSeconds?: number | null;
    }) => {
      const title = input.title?.trim();
      const videoUrl = input.videoUrl?.trim();
      if (!title || title.length > 120) throw new Error("Title must be 1-120 characters");
      if (!videoUrl) throw new Error("A video is required");
      if ((input.description ?? "").length > 1000) throw new Error("Description too long");
      return {
        title,
        description: input.description?.trim() || null,
        category: input.category || "General",
        videoUrl,
        durationSeconds: input.durationSeconds ?? null,
      };
    },
  )
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("reels").insert({
      user_id: context.userId,
      title: data.title,
      description: data.description,
      category: data.category,
      video_url: data.videoUrl,
      duration_seconds: data.durationSeconds,
      status: "pending",
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const deleteReel = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { id: string }) => input)
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("reels").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const toggleReelLike = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { id: string; liked: boolean }) => input)
  .handler(async ({ data, context }) => {
    if (data.liked) {
      const { error } = await context.supabase
        .from("reel_likes")
        .delete()
        .eq("reel_id", data.id)
        .eq("user_id", context.userId);
      if (error) throw new Error(error.message);
      return { liked: false };
    }
    const { error } = await context.supabase
      .from("reel_likes")
      .insert({ reel_id: data.id, user_id: context.userId });
    if (error && !error.message.includes("duplicate")) throw new Error(error.message);
    return { liked: true };
  });

export const getMyReelLikes = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data } = await context.supabase
      .from("reel_likes")
      .select("reel_id")
      .eq("user_id", context.userId);
    return (data ?? []).map((r) => r.reel_id);
  });

export const registerReelView = createServerFn({ method: "POST" })
  .inputValidator((input: { id: string }) => input)
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: row } = await supabaseAdmin
      .from("reels")
      .select("views, status")
      .eq("id", data.id)
      .maybeSingle();
    if (!row || row.status !== "approved") return { ok: false };
    await supabaseAdmin
      .from("reels")
      .update({ views: (row.views ?? 0) + 1 })
      .eq("id", data.id);
    return { ok: true };
  });

export const listReelsForReview = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertModerator(context);
    const { data: rows, error } = await context.supabase
      .from("reels")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(200);
    if (error) throw new Error(error.message);
    return toReelDTOs(context.supabase, rows ?? [], context.userId);
  });

export const setReelStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { id: string; status: "approved" | "rejected" | "pending" }) => {
    if (!["approved", "rejected", "pending"].includes(input.status)) {
      throw new Error("Invalid status");
    }
    return input;
  })
  .handler(async ({ data, context }) => {
    await assertModerator(context);
    const { error } = await context.supabase
      .from("reels")
      .update({ status: data.status })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
