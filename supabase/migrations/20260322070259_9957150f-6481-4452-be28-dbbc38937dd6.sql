
-- Profiles table
CREATE TABLE public.profiles_data (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  name text NOT NULL,
  band_id text NOT NULL DEFAULT 'band-a',
  disco_id text NOT NULL DEFAULT 'ikedc',
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles_data ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profiles" ON public.profiles_data FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own profiles" ON public.profiles_data FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own profiles" ON public.profiles_data FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own profiles" ON public.profiles_data FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Profile appliances table
CREATE TABLE public.profile_appliances (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL REFERENCES public.profiles_data(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  appliance_id text NOT NULL,
  appliance_name text NOT NULL,
  appliance_watts integer NOT NULL,
  appliance_icon text NOT NULL DEFAULT '🔌',
  appliance_tip text NOT NULL DEFAULT '',
  hours_per_day integer NOT NULL DEFAULT 1,
  quantity integer NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.profile_appliances ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile appliances" ON public.profile_appliances FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own profile appliances" ON public.profile_appliances FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own profile appliances" ON public.profile_appliances FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own profile appliances" ON public.profile_appliances FOR DELETE TO authenticated USING (auth.uid() = user_id);
