CREATE POLICY "Users can upload their own reel videos"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'reels' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users can read their own reel videos"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'reels' AND ((storage.foldername(name))[1] = auth.uid()::text
    OR public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'moderator')));

CREATE POLICY "Users can update their own reel videos"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'reels' AND (storage.foldername(name))[1] = auth.uid()::text)
  WITH CHECK (bucket_id = 'reels' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users and moderators can delete reel videos"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'reels' AND ((storage.foldername(name))[1] = auth.uid()::text
    OR public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'moderator')));