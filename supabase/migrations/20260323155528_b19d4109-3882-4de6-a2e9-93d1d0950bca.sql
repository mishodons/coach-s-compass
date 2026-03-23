
-- Enums
CREATE TYPE public.player_level AS ENUM ('beginner', 'intermediate', 'advanced');
CREATE TYPE public.player_status AS ENUM ('active', 'inactive');
CREATE TYPE public.app_role AS ENUM ('academy_admin', 'head_coach', 'assistant_coach');

-- Timestamp update function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Academies
CREATE TABLE public.academies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.academies ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER update_academies_updated_at BEFORE UPDATE ON public.academies FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Profiles (linked to auth.users)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  academy_id UUID REFERENCES public.academies(id),
  full_name TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- User roles table (separate from profiles per security best practices)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function for role checks
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role
  )
$$;

-- Get user's academy_id
CREATE OR REPLACE FUNCTION public.get_user_academy_id(_user_id UUID)
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT academy_id FROM public.profiles WHERE id = _user_id
$$;

-- Players
CREATE TABLE public.players (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  academy_id UUID NOT NULL REFERENCES public.academies(id),
  full_name TEXT NOT NULL,
  date_of_birth DATE,
  level player_level NOT NULL DEFAULT 'beginner',
  status player_status NOT NULL DEFAULT 'active',
  start_date DATE DEFAULT CURRENT_DATE,
  head_coach_id UUID REFERENCES public.profiles(id),
  notes_summary TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.players ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER update_players_updated_at BEFORE UPDATE ON public.players FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Player assistant coaches
CREATE TABLE public.player_assistant_coaches (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  player_id UUID NOT NULL REFERENCES public.players(id) ON DELETE CASCADE,
  coach_id UUID NOT NULL REFERENCES public.profiles(id)
);
ALTER TABLE public.player_assistant_coaches ENABLE ROW LEVEL SECURITY;

-- Skill categories
CREATE TABLE public.skill_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  sort_order INT NOT NULL DEFAULT 0
);
ALTER TABLE public.skill_categories ENABLE ROW LEVEL SECURITY;

-- Skill subcategories
CREATE TABLE public.skill_subcategories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  category_id UUID NOT NULL REFERENCES public.skill_categories(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  sort_order INT NOT NULL DEFAULT 0
);
ALTER TABLE public.skill_subcategories ENABLE ROW LEVEL SECURITY;

-- Skill items
CREATE TABLE public.skill_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  subcategory_id UUID NOT NULL REFERENCES public.skill_subcategories(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  sort_order INT NOT NULL DEFAULT 0
);
ALTER TABLE public.skill_items ENABLE ROW LEVEL SECURITY;

-- Player skill items
CREATE TABLE public.player_skill_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  player_id UUID NOT NULL REFERENCES public.players(id) ON DELETE CASCADE,
  skill_item_id UUID NOT NULL REFERENCES public.skill_items(id),
  planned_order INT DEFAULT 0,
  status INT NOT NULL DEFAULT 1,
  times_logged INT NOT NULL DEFAULT 0,
  last_trained_at TIMESTAMPTZ,
  coach_note TEXT DEFAULT '',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.player_skill_items ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER update_player_skill_items_updated_at BEFORE UPDATE ON public.player_skill_items FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Training templates
CREATE TABLE public.training_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  level_tag player_level
);
ALTER TABLE public.training_templates ENABLE ROW LEVEL SECURITY;

-- Training template items
CREATE TABLE public.training_template_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  template_id UUID NOT NULL REFERENCES public.training_templates(id) ON DELETE CASCADE,
  skill_item_id UUID NOT NULL REFERENCES public.skill_items(id),
  planned_order INT DEFAULT 0,
  default_status INT NOT NULL DEFAULT 1
);
ALTER TABLE public.training_template_items ENABLE ROW LEVEL SECURITY;

-- Session logs
CREATE TABLE public.session_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  player_id UUID NOT NULL REFERENCES public.players(id) ON DELETE CASCADE,
  coach_id UUID NOT NULL REFERENCES public.profiles(id),
  session_date DATE NOT NULL DEFAULT CURRENT_DATE,
  note TEXT DEFAULT '',
  duration_minutes INT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.session_logs ENABLE ROW LEVEL SECURITY;

-- Session log skill items
CREATE TABLE public.session_log_skill_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_log_id UUID NOT NULL REFERENCES public.session_logs(id) ON DELETE CASCADE,
  player_skill_item_id UUID NOT NULL REFERENCES public.player_skill_items(id),
  status_after_session INT
);
ALTER TABLE public.session_log_skill_items ENABLE ROW LEVEL SECURITY;

-- Schedule entries
CREATE TABLE public.schedule_entries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  player_id UUID NOT NULL REFERENCES public.players(id) ON DELETE CASCADE,
  day_of_week INT NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  session_type TEXT DEFAULT '',
  location TEXT DEFAULT '',
  notes TEXT DEFAULT ''
);
ALTER TABLE public.schedule_entries ENABLE ROW LEVEL SECURITY;

-- Tournament records
CREATE TABLE public.tournament_records (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  player_id UUID NOT NULL REFERENCES public.players(id) ON DELETE CASCADE,
  tournament_name TEXT NOT NULL,
  start_date DATE,
  end_date DATE,
  result TEXT DEFAULT '',
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.tournament_records ENABLE ROW LEVEL SECURITY;

-- RLS POLICIES

-- Academies: users can see their own academy
CREATE POLICY "Users can view own academy" ON public.academies FOR SELECT TO authenticated USING (id = public.get_user_academy_id(auth.uid()));

-- Profiles: users can see profiles in their academy
CREATE POLICY "Users can view academy profiles" ON public.profiles FOR SELECT TO authenticated USING (academy_id = public.get_user_academy_id(auth.uid()));
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE TO authenticated USING (id = auth.uid());
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (id = auth.uid());

-- User roles: users can see their own roles
CREATE POLICY "Users can view own roles" ON public.user_roles FOR SELECT TO authenticated USING (user_id = auth.uid());

-- Players: academy-scoped, admins see all, coaches see assigned
CREATE POLICY "Admins can view all academy players" ON public.players FOR SELECT TO authenticated
  USING (
    academy_id = public.get_user_academy_id(auth.uid())
    AND (
      public.has_role(auth.uid(), 'academy_admin')
      OR head_coach_id = auth.uid()
      OR EXISTS (SELECT 1 FROM public.player_assistant_coaches WHERE player_id = id AND coach_id = auth.uid())
    )
  );
CREATE POLICY "Admins can insert players" ON public.players FOR INSERT TO authenticated
  WITH CHECK (academy_id = public.get_user_academy_id(auth.uid()));
CREATE POLICY "Coaches can update players" ON public.players FOR UPDATE TO authenticated
  USING (academy_id = public.get_user_academy_id(auth.uid()));
CREATE POLICY "Admins can delete players" ON public.players FOR DELETE TO authenticated
  USING (academy_id = public.get_user_academy_id(auth.uid()) AND public.has_role(auth.uid(), 'academy_admin'));

-- Player assistant coaches
CREATE POLICY "View player assistant coaches" ON public.player_assistant_coaches FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.players WHERE id = player_id AND academy_id = public.get_user_academy_id(auth.uid())));
CREATE POLICY "Manage player assistant coaches" ON public.player_assistant_coaches FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.players WHERE id = player_id AND academy_id = public.get_user_academy_id(auth.uid())));
CREATE POLICY "Delete player assistant coaches" ON public.player_assistant_coaches FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.players WHERE id = player_id AND academy_id = public.get_user_academy_id(auth.uid())));

-- Skill taxonomy: readable by all authenticated
CREATE POLICY "Anyone can view skill categories" ON public.skill_categories FOR SELECT TO authenticated USING (true);
CREATE POLICY "Anyone can view skill subcategories" ON public.skill_subcategories FOR SELECT TO authenticated USING (true);
CREATE POLICY "Anyone can view skill items" ON public.skill_items FOR SELECT TO authenticated USING (true);

-- Player skill items: academy-scoped
CREATE POLICY "View player skill items" ON public.player_skill_items FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.players WHERE id = player_id AND academy_id = public.get_user_academy_id(auth.uid())));
CREATE POLICY "Insert player skill items" ON public.player_skill_items FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.players WHERE id = player_id AND academy_id = public.get_user_academy_id(auth.uid())));
CREATE POLICY "Update player skill items" ON public.player_skill_items FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.players WHERE id = player_id AND academy_id = public.get_user_academy_id(auth.uid())));

-- Training templates: readable by all
CREATE POLICY "Anyone can view templates" ON public.training_templates FOR SELECT TO authenticated USING (true);
CREATE POLICY "Anyone can view template items" ON public.training_template_items FOR SELECT TO authenticated USING (true);

-- Session logs: academy-scoped
CREATE POLICY "View session logs" ON public.session_logs FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.players WHERE id = player_id AND academy_id = public.get_user_academy_id(auth.uid())));
CREATE POLICY "Insert session logs" ON public.session_logs FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.players WHERE id = player_id AND academy_id = public.get_user_academy_id(auth.uid())));

-- Session log skill items
CREATE POLICY "View session log skill items" ON public.session_log_skill_items FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.session_logs sl WHERE sl.id = session_log_id AND EXISTS (SELECT 1 FROM public.players WHERE id = sl.player_id AND academy_id = public.get_user_academy_id(auth.uid()))));
CREATE POLICY "Insert session log skill items" ON public.session_log_skill_items FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.session_logs sl WHERE sl.id = session_log_id AND EXISTS (SELECT 1 FROM public.players WHERE id = sl.player_id AND academy_id = public.get_user_academy_id(auth.uid()))));

-- Schedule entries
CREATE POLICY "View schedule entries" ON public.schedule_entries FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.players WHERE id = player_id AND academy_id = public.get_user_academy_id(auth.uid())));
CREATE POLICY "Manage schedule entries" ON public.schedule_entries FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.players WHERE id = player_id AND academy_id = public.get_user_academy_id(auth.uid())));
CREATE POLICY "Update schedule entries" ON public.schedule_entries FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.players WHERE id = player_id AND academy_id = public.get_user_academy_id(auth.uid())));
CREATE POLICY "Delete schedule entries" ON public.schedule_entries FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.players WHERE id = player_id AND academy_id = public.get_user_academy_id(auth.uid())));

-- Tournament records
CREATE POLICY "View tournament records" ON public.tournament_records FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.players WHERE id = player_id AND academy_id = public.get_user_academy_id(auth.uid())));
CREATE POLICY "Insert tournament records" ON public.tournament_records FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.players WHERE id = player_id AND academy_id = public.get_user_academy_id(auth.uid())));
CREATE POLICY "Update tournament records" ON public.tournament_records FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.players WHERE id = player_id AND academy_id = public.get_user_academy_id(auth.uid())));
CREATE POLICY "Delete tournament records" ON public.tournament_records FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.players WHERE id = player_id AND academy_id = public.get_user_academy_id(auth.uid())));

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'full_name', ''));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
