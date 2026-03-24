
-- player_ota_profiles
CREATE TABLE public.player_ota_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id uuid NOT NULL UNIQUE REFERENCES public.players(id) ON DELETE CASCADE,
  ota_id text,
  ota_guid text,
  wtn_singles numeric(4,1),
  career_wins integer DEFAULT 0,
  career_losses integer DEFAULT 0,
  career_total integer DEFAULT 0,
  year_wins integer DEFAULT 0,
  year_losses integer DEFAULT 0,
  scraped_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.player_ota_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "View player OTA profiles" ON public.player_ota_profiles FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM players WHERE players.id = player_ota_profiles.player_id AND players.academy_id = get_user_academy_id(auth.uid())));
CREATE POLICY "Insert player OTA profiles" ON public.player_ota_profiles FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM players WHERE players.id = player_ota_profiles.player_id AND players.academy_id = get_user_academy_id(auth.uid())));
CREATE POLICY "Update player OTA profiles" ON public.player_ota_profiles FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM players WHERE players.id = player_ota_profiles.player_id AND players.academy_id = get_user_academy_id(auth.uid())));
CREATE POLICY "Delete player OTA profiles" ON public.player_ota_profiles FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM players WHERE players.id = player_ota_profiles.player_id AND players.academy_id = get_user_academy_id(auth.uid())));

-- player_tournaments
CREATE TABLE public.player_tournaments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id uuid NOT NULL REFERENCES public.players(id) ON DELETE CASCADE,
  tournament_name text NOT NULL,
  location text,
  start_date date,
  end_date date,
  category text,
  level text,
  draw text,
  is_upcoming boolean DEFAULT false,
  result_summary text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.player_tournaments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "View player tournaments" ON public.player_tournaments FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM players WHERE players.id = player_tournaments.player_id AND players.academy_id = get_user_academy_id(auth.uid())));
CREATE POLICY "Insert player tournaments" ON public.player_tournaments FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM players WHERE players.id = player_tournaments.player_id AND players.academy_id = get_user_academy_id(auth.uid())));
CREATE POLICY "Update player tournaments" ON public.player_tournaments FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM players WHERE players.id = player_tournaments.player_id AND players.academy_id = get_user_academy_id(auth.uid())));
CREATE POLICY "Delete player tournaments" ON public.player_tournaments FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM players WHERE players.id = player_tournaments.player_id AND players.academy_id = get_user_academy_id(auth.uid())));

-- player_matches
CREATE TABLE public.player_matches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id uuid NOT NULL REFERENCES public.players(id) ON DELETE CASCADE,
  tournament_id uuid REFERENCES public.player_tournaments(id) ON DELETE SET NULL,
  round text,
  opponent_name text,
  score text,
  result text,
  match_date date,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.player_matches ENABLE ROW LEVEL SECURITY;
CREATE POLICY "View player matches" ON public.player_matches FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM players WHERE players.id = player_matches.player_id AND players.academy_id = get_user_academy_id(auth.uid())));
CREATE POLICY "Insert player matches" ON public.player_matches FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM players WHERE players.id = player_matches.player_id AND players.academy_id = get_user_academy_id(auth.uid())));
CREATE POLICY "Update player matches" ON public.player_matches FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM players WHERE players.id = player_matches.player_id AND players.academy_id = get_user_academy_id(auth.uid())));
CREATE POLICY "Delete player matches" ON public.player_matches FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM players WHERE players.id = player_matches.player_id AND players.academy_id = get_user_academy_id(auth.uid())));

-- player_ranking_history
CREATE TABLE public.player_ranking_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id uuid NOT NULL REFERENCES public.players(id) ON DELETE CASCADE,
  recorded_date date NOT NULL,
  ranking integer,
  points numeric,
  source text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.player_ranking_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "View player ranking history" ON public.player_ranking_history FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM players WHERE players.id = player_ranking_history.player_id AND players.academy_id = get_user_academy_id(auth.uid())));
CREATE POLICY "Insert player ranking history" ON public.player_ranking_history FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM players WHERE players.id = player_ranking_history.player_id AND players.academy_id = get_user_academy_id(auth.uid())));
CREATE POLICY "Update player ranking history" ON public.player_ranking_history FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM players WHERE players.id = player_ranking_history.player_id AND players.academy_id = get_user_academy_id(auth.uid())));
CREATE POLICY "Delete player ranking history" ON public.player_ranking_history FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM players WHERE players.id = player_ranking_history.player_id AND players.academy_id = get_user_academy_id(auth.uid())));

-- Add validation trigger for result column on player_matches
CREATE OR REPLACE FUNCTION public.validate_match_result()
RETURNS trigger LANGUAGE plpgsql SET search_path TO 'public' AS $$
BEGIN
  IF NEW.result IS NOT NULL AND NEW.result NOT IN ('W', 'L') THEN
    RAISE EXCEPTION 'result must be W or L';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER check_match_result BEFORE INSERT OR UPDATE ON public.player_matches
  FOR EACH ROW EXECUTE FUNCTION public.validate_match_result();
