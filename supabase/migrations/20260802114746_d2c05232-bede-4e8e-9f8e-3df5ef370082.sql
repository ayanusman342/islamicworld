CREATE TABLE public.reels (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  video_url text NOT NULL,
  thumbnail_url text,
  category text NOT NULL DEFAULT 'General',
  duration_seconds integer,
  status text NOT NULL DEFAULT 'pending',
  views integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.reels TO authenticated;
GRANT SELECT ON public.reels TO anon;
GRANT ALL ON public.reels TO service_role;

ALTER TABLE public.reels ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Approved reels are viewable by everyone"
  ON public.reels FOR SELECT
  USING (status = 'approved');

CREATE POLICY "Users can view their own reels"
  ON public.reels FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Moderators can view all reels"
  ON public.reels FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'moderator'));

CREATE POLICY "Users can upload their own reels"
  ON public.reels FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reels"
  ON public.reels FOR UPDATE TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Moderators can update any reel"
  ON public.reels FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'moderator'))
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'moderator'));

CREATE POLICY "Users can delete their own reels"
  ON public.reels FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Moderators can delete any reel"
  ON public.reels FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'moderator'));

CREATE INDEX reels_status_created_idx ON public.reels (status, created_at DESC);

CREATE TABLE public.reel_likes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reel_id uuid NOT NULL REFERENCES public.reels(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (reel_id, user_id)
);

GRANT SELECT, INSERT, DELETE ON public.reel_likes TO authenticated;
GRANT SELECT ON public.reel_likes TO anon;
GRANT ALL ON public.reel_likes TO service_role;

ALTER TABLE public.reel_likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Likes on approved reels are viewable by everyone"
  ON public.reel_likes FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.reels r WHERE r.id = reel_id AND r.status = 'approved'));

CREATE POLICY "Users can like reels"
  ON public.reel_likes FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove their own likes"
  ON public.reel_likes FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_reels_updated_at
BEFORE UPDATE ON public.reels
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE FUNCTION public.increment_reel_views(_reel_id uuid)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE public.reels SET views = views + 1 WHERE id = _reel_id AND status = 'approved';
$$;

REVOKE ALL ON FUNCTION public.increment_reel_views(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.increment_reel_views(uuid) TO anon, authenticated, service_role;