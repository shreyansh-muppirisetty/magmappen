-- Allow insert/update/delete for managing users (no auth required for this app)
CREATE POLICY "Allow insert on allowed_users" ON public.allowed_users
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow update on allowed_users" ON public.allowed_users
  FOR UPDATE USING (true);

CREATE POLICY "Allow delete on allowed_users" ON public.allowed_users
  FOR DELETE USING (true);