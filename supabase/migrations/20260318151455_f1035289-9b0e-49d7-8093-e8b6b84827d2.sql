-- Create allowed_users table
CREATE TABLE public.allowed_users (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL UNIQUE,
  blocked BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.allowed_users ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read (for login check)
CREATE POLICY "Anyone can read allowed_users" ON public.allowed_users
  FOR SELECT USING (true);

-- Insert initial users
INSERT INTO public.allowed_users (user_id) VALUES
  ('13demilola'),
  ('jp13'),
  ('Thunderkid13'),
  ('sm13'),
  ('ayansh45'),
  ('brodie123'),
  ('freetrial');