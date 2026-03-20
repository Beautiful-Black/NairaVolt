
-- Custom appliances saved to user's account-wide library
CREATE TABLE public.custom_appliances (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  average_watts INTEGER NOT NULL,
  icon TEXT NOT NULL DEFAULT '🔌',
  wise_usage TEXT NOT NULL DEFAULT 'Monitor usage closely and turn off when not needed.',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.custom_appliances ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own custom appliances"
  ON public.custom_appliances FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own custom appliances"
  ON public.custom_appliances FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own custom appliances"
  ON public.custom_appliances FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);
