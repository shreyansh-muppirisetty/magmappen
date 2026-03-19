
CREATE TABLE public.site_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  value text NOT NULL DEFAULT '',
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read site_settings" ON public.site_settings FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Anyone can update site_settings" ON public.site_settings FOR UPDATE USING (true);
CREATE POLICY "Anyone can insert site_settings" ON public.site_settings FOR INSERT WITH CHECK (true);

INSERT INTO public.site_settings (key, value) VALUES ('redirect_enabled', 'false');
INSERT INTO public.site_settings (key, value) VALUES ('redirect_url', 'https://magmamath.lovable.app');
INSERT INTO public.site_settings (key, value) VALUES ('redirect_message', 'Website has changed names for today. If you want to play you have to go to:');
