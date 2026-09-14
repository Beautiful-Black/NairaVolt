CREATE POLICY "Reset codes are never available to client roles"
  ON public.password_reset_otps FOR ALL
  TO anon, authenticated
  USING (false)
  WITH CHECK (false);