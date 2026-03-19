CREATE TABLE public.games (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  url text NOT NULL,
  category text NOT NULL DEFAULT 'Portal',
  icon text NOT NULL DEFAULT 'Gamepad2',
  color text NOT NULL DEFAULT 'hsl(270 80% 65%)',
  min_tier user_tier NOT NULL DEFAULT 'freetrial',
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.games ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read games" ON public.games FOR SELECT TO public USING (true);
CREATE POLICY "Allow insert on games" ON public.games FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Allow update on games" ON public.games FOR UPDATE TO public USING (true);
CREATE POLICY "Allow delete on games" ON public.games FOR DELETE TO public USING (true);

-- Seed with existing games
INSERT INTO public.games (name, url, category, icon, color, min_tier) VALUES
  ('Game Hub', 'https://learningmathisreallyfun.b-cdn.net/?/', 'Portal', 'Gamepad2', 'hsl(270 80% 65%)', 'freetrial'),
  ('55 Games', 'https://55gms.com/g', 'Portal', 'Zap', 'hsl(340 85% 60%)', 'freetrial'),
  ('Cymath', 'https://cymath.com', 'Study', 'Star', 'hsl(200 80% 55%)', 'pro'),
  ('Frogiee Edu', 'https://frogieeisback-edu.zone.id/', 'Portal', 'Ghost', 'hsl(140 70% 50%)', 'freetrial'),
  ('Math Zone', 'https://math.kazw.net/', 'Portal', 'Puzzle', 'hsl(30 85% 55%)', 'freetrial'),
  ('Shadow Realm', 'https://shadow-realm.gravityenergygenerator.com/', 'Portal', 'Swords', 'hsl(0 70% 50%)', 'freetrial'),
  ('Danish Shoes', 'https://danish-shoes.dalbirsinghbaraili.com.np/', 'Portal', 'Car', 'hsl(45 80% 55%)', 'pro'),
  ('Browser', 'https://browser.lol', 'Portal', 'Trophy', 'hsl(220 75% 60%)', 'freetrial'),
  ('Google Doodles', 'https://www.google.com/doodles', 'Portal', 'Puzzle', 'hsl(120 65% 50%)', 'trash'),
  ('CalcSolver', 'https://calcsolver.net', 'Study', 'Zap', 'hsl(180 70% 50%)', 'trash'),
  ('Magma', 'https://magma.se', 'Portal', 'Swords', 'hsl(10 75% 55%)', 'trash');