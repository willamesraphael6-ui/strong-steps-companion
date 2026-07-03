
-- Idiomas: catálogo de tarefas
CREATE TABLE public.language_tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lang_code text NOT NULL,
  category text NOT NULL DEFAULT 'basico',
  difficulty int NOT NULL DEFAULT 1,
  title text NOT NULL,
  target text NOT NULL,
  translation_pt text NOT NULL,
  pronunciation text,
  order_index int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.language_tasks TO anon, authenticated;
GRANT ALL ON public.language_tasks TO service_role;
ALTER TABLE public.language_tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read language tasks" ON public.language_tasks FOR SELECT USING (true);
CREATE POLICY "Anyone can manage language tasks" ON public.language_tasks FOR ALL USING (true) WITH CHECK (true);
CREATE INDEX language_tasks_lang_idx ON public.language_tasks(lang_code, order_index);

-- Progresso por perfil
CREATE TABLE public.user_task_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL,
  task_id uuid NOT NULL,
  completed_at timestamptz NOT NULL DEFAULT now(),
  score int NOT NULL DEFAULT 0,
  UNIQUE(profile_id, task_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_task_progress TO anon, authenticated;
GRANT ALL ON public.user_task_progress TO service_role;
ALTER TABLE public.user_task_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can manage progress" ON public.user_task_progress FOR ALL USING (true) WITH CHECK (true);
CREATE INDEX user_task_progress_profile_idx ON public.user_task_progress(profile_id);

-- Análises de comida
CREATE TABLE public.food_analyses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL,
  image_url text,
  verdict text NOT NULL,
  can_eat boolean NOT NULL DEFAULT true,
  calories_estimate int,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.food_analyses TO anon, authenticated;
GRANT ALL ON public.food_analyses TO service_role;
ALTER TABLE public.food_analyses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can manage food analyses" ON public.food_analyses FOR ALL USING (true) WITH CHECK (true);

-- Análises corporais
CREATE TABLE public.body_analyses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL,
  image_url text,
  body_type text,
  strengths text,
  focus_areas text,
  recommendations text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.body_analyses TO anon, authenticated;
GRANT ALL ON public.body_analyses TO service_role;
ALTER TABLE public.body_analyses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can manage body analyses" ON public.body_analyses FOR ALL USING (true) WITH CHECK (true);

-- Assinaturas
CREATE TABLE public.subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  provider text NOT NULL DEFAULT 'krypt',
  provider_ref text,
  amount_cents int NOT NULL DEFAULT 2990,
  pix_code text,
  pix_qr text,
  expires_at timestamptz,
  paid_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.subscriptions TO anon, authenticated;
GRANT ALL ON public.subscriptions TO service_role;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can manage subscriptions" ON public.subscriptions FOR ALL USING (true) WITH CHECK (true);
CREATE INDEX subscriptions_profile_idx ON public.subscriptions(profile_id, status);
CREATE TRIGGER subscriptions_set_updated_at BEFORE UPDATE ON public.subscriptions FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
