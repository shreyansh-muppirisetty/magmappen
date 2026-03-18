CREATE TYPE public.user_tier AS ENUM ('freetrial', 'trash', 'pro', 'hacker');
ALTER TABLE public.allowed_users ADD COLUMN tier public.user_tier NOT NULL DEFAULT 'freetrial';