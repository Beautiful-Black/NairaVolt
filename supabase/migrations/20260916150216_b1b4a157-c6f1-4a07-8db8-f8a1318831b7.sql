-- Restore explicit Data API grants for the owner-scoped application tables.
GRANT SELECT, INSERT, UPDATE, DELETE ON public.custom_appliances TO authenticated;
GRANT ALL ON public.custom_appliances TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles_data TO authenticated;
GRANT ALL ON public.profiles_data TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profile_appliances TO authenticated;
GRANT ALL ON public.profile_appliances TO service_role;
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;

-- Permissions live separately from account profile data.
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

CREATE POLICY "Users can view their own roles"
  ON public.user_roles FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can grant roles"
  ON public.user_roles FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can change roles"
  ON public.user_roles FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can revoke roles"
  ON public.user_roles FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.user_feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  category text NOT NULL DEFAULT 'general',
  message text NOT NULL,
  rating smallint,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT INSERT ON public.user_feedback TO authenticated;
GRANT SELECT, UPDATE, DELETE ON public.user_feedback TO authenticated;
GRANT ALL ON public.user_feedback TO service_role;
ALTER TABLE public.user_feedback ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can send their own feedback"
  ON public.user_feedback FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can view their own feedback"
  ON public.user_feedback FOR SELECT TO authenticated
  USING (auth.uid() = user_id);
CREATE POLICY "Feedback moderators can review feedback"
  ON public.user_feedback FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'moderator'));
CREATE POLICY "Feedback moderators can update feedback"
  ON public.user_feedback FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'moderator'))
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'moderator'));
CREATE POLICY "Feedback moderators can delete feedback"
  ON public.user_feedback FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'moderator'));

CREATE INDEX user_feedback_created_at_idx ON public.user_feedback (created_at DESC);
CREATE INDEX user_feedback_user_id_idx ON public.user_feedback (user_id, created_at DESC);