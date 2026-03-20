
INSERT INTO storage.buckets (id, name, public) VALUES ('chat-avatars', 'chat-avatars', true);

CREATE POLICY "Anyone can upload chat avatars"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'chat-avatars');

CREATE POLICY "Anyone can view chat avatars"
ON storage.objects FOR SELECT
USING (bucket_id = 'chat-avatars');
