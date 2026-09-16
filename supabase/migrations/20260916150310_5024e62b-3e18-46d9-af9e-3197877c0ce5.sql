CREATE SCHEMA IF NOT EXISTS private;
REVOKE ALL ON SCHEMA private FROM PUBLIC;
GRANT USAGE ON SCHEMA private TO authenticated, service_role;

DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can grant roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can change roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can revoke roles" ON public.user_roles;
DROP POLICY IF EXISTS "Feedback moderators can review feedback" ON public.user_feedback;
DROP POLICY IF EXISTS "Feedback moderators can update feedback" ON public.user_feedback;
DROP POLICY IF EXISTS "Feedback moderators can delete feedback" ON public.user_feedback;

DROP FUNCTION IF EXISTS public.has_role(uuid, public.app_role);

CREATE OR REPLACE FUNCTION private.has_role(_user_id uuid, _role public.app_role)
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

REVOKE ALL ON FUNCTION private.has_role(uuid, public.app_role) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION private.has_role(uuid, public.app_role) TO authenticated, service_role;

CREATE POLICY "Users can view their own roles"
  ON public.user_roles FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR private.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "Admins can grant roles"
  ON public.user_roles FOR INSERT TO authenticated
  WITH CHECK (private.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "Admins can change roles"
  ON public.user_roles FOR UPDATE TO authenticated
  USING (private.has_role(auth.uid(), 'admin'::public.app_role))
  WITH CHECK (private.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "Admins can revoke roles"
  ON public.user_roles FOR DELETE TO authenticated
  USING (private.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "Feedback moderators can review feedback"
  ON public.user_feedback FOR SELECT TO authenticated
  USING (private.has_role(auth.uid(), 'admin'::public.app_role) OR private.has_role(auth.uid(), 'moderator'::public.app_role));
CREATE POLICY "Feedback moderators can update feedback"
  ON public.user_feedback FOR UPDATE TO authenticated
  USING (private.has_role(auth.uid(), 'admin'::public.app_role) OR private.has_role(auth.uid(), 'moderator'::public.app_role))
  WITH CHECK (private.has_role(auth.uid(), 'admin'::public.app_role) OR private.has_role(auth.uid(), 'moderator'::public.app_role));
CREATE POLICY "Feedback moderators can delete feedback"
  ON public.user_feedback FOR DELETE TO authenticated
  USING (private.has_role(auth.uid(), 'admin'::public.app_role) OR private.has_role(auth.uid(), 'moderator'::public.app_role));

DROP POLICY IF EXISTS "Users can view their own profile appliances" ON public.profile_appliances;
DROP POLICY IF EXISTS "Users can insert their own profile appliances" ON public.profile_appliances;
DROP POLICY IF EXISTS "Users can update their own profile appliances" ON public.profile_appliances;
DROP POLICY IF EXISTS "Users can delete their own profile appliances" ON public.profile_appliances;

CREATE POLICY "Users can view appliances in their own profiles"
  ON public.profile_appliances FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles_data p WHERE p.id = profile_id AND p.user_id = auth.uid()) AND user_id = auth.uid());
CREATE POLICY "Users can add appliances to their own profiles"
  ON public.profile_appliances FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles_data p WHERE p.id = profile_id AND p.user_id = auth.uid()) AND user_id = auth.uid());
CREATE POLICY "Users can update appliances in their own profiles"
  ON public.profile_appliances FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles_data p WHERE p.id = profile_id AND p.user_id = auth.uid()) AND user_id = auth.uid())
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles_data p WHERE p.id = profile_id AND p.user_id = auth.uid()) AND user_id = auth.uid());
CREATE POLICY "Users can delete appliances in their own profiles"
  ON public.profile_appliances FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles_data p WHERE p.id = profile_id AND p.user_id = auth.uid()) AND user_id = auth.uid());

CREATE OR REPLACE FUNCTION public.validate_profile_appliance_owner()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM public.profiles_data
    WHERE id = NEW.profile_id AND user_id = NEW.user_id
  ) THEN
    RAISE EXCEPTION 'Profile appliance owner does not match profile owner';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS validate_profile_appliance_owner ON public.profile_appliances;
CREATE TRIGGER validate_profile_appliance_owner
BEFORE INSERT OR UPDATE ON public.profile_appliances
FOR EACH ROW EXECUTE FUNCTION public.validate_profile_appliance_owner();