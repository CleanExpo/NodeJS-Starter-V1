-- =============================================================================
-- Migration: Nutrition Schema
-- Description: Creates 7 tables for the FND Nutrition Health module
-- =============================================================================

-- user_health_profiles (one-to-one with auth.users)
CREATE TABLE public.user_health_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  weight_kg NUMERIC(5,2),
  height_cm NUMERIC(5,2),
  date_of_birth DATE,
  sex TEXT CHECK (sex IN ('male','female','non_binary','prefer_not_to_say')),
  protein_target_g NUMERIC(5,1),
  dietary_restrictions JSONB DEFAULT '[]',
  fnd_symptoms JSONB DEFAULT '[]',
  health_goals JSONB DEFAULT '[]',
  known_triggers JSONB DEFAULT '[]',
  magnesium_target_mg NUMERIC(6,1) DEFAULT 400,
  vitamin_d_target_iu NUMERIC(7,1) DEFAULT 2000,
  calcium_target_mg NUMERIC(6,1) DEFAULT 1000,
  omega3_target_g NUMERIC(4,1) DEFAULT 2.0,
  b12_target_mcg NUMERIC(5,1) DEFAULT 2.4,
  onboarding_completed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE public.user_health_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own health profile"
  ON public.user_health_profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own health profile"
  ON public.user_health_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own health profile"
  ON public.user_health_profiles FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own health profile"
  ON public.user_health_profiles FOR DELETE
  USING (auth.uid() = user_id);

CREATE INDEX user_health_profiles_user_id_idx ON public.user_health_profiles(user_id);

CREATE TRIGGER user_health_profiles_updated_at
  BEFORE UPDATE ON public.user_health_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- recipes (seed + user-created)
CREATE TABLE public.recipes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL,
  meal_type TEXT NOT NULL CHECK (meal_type IN ('breakfast','lunch','dinner','snack','dessert')),
  dietary_tags JSONB DEFAULT '[]',
  fnd_benefits JSONB DEFAULT '[]',
  trigger_free JSONB DEFAULT '[]',
  prep_time_minutes INTEGER NOT NULL DEFAULT 0,
  cook_time_minutes INTEGER NOT NULL DEFAULT 0,
  total_time_minutes INTEGER GENERATED ALWAYS AS (prep_time_minutes + cook_time_minutes) STORED,
  servings INTEGER NOT NULL DEFAULT 1,
  difficulty TEXT NOT NULL DEFAULT 'easy' CHECK (difficulty IN ('easy','medium','hard')),
  instructions JSONB NOT NULL DEFAULT '[]',
  fnd_notes TEXT,
  image_url TEXT,
  calories_per_serving NUMERIC(7,2),
  protein_g NUMERIC(6,2),
  carbs_g NUMERIC(6,2),
  fat_g NUMERIC(6,2),
  fiber_g NUMERIC(6,2),
  magnesium_mg NUMERIC(6,2),
  vitamin_d_iu NUMERIC(7,2),
  calcium_mg NUMERIC(6,2),
  omega3_g NUMERIC(5,2),
  b12_mcg NUMERIC(5,2),
  is_seed BOOLEAN DEFAULT true,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE public.recipes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view all recipes"
  ON public.recipes FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert own custom recipes"
  ON public.recipes FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by AND is_seed = false);

CREATE POLICY "Users can update own custom recipes"
  ON public.recipes FOR UPDATE
  TO authenticated
  USING (auth.uid() = created_by AND is_seed = false);

CREATE POLICY "Users can delete own custom recipes"
  ON public.recipes FOR DELETE
  TO authenticated
  USING (auth.uid() = created_by AND is_seed = false);

CREATE INDEX recipes_meal_type_idx ON public.recipes(meal_type);
CREATE INDEX recipes_slug_idx ON public.recipes(slug);
CREATE INDEX recipes_dietary_tags_idx ON public.recipes USING GIN (dietary_tags);
CREATE INDEX recipes_fnd_benefits_idx ON public.recipes USING GIN (fnd_benefits);
CREATE INDEX recipes_trigger_free_idx ON public.recipes USING GIN (trigger_free);

CREATE TRIGGER recipes_updated_at
  BEFORE UPDATE ON public.recipes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- recipe_ingredients
CREATE TABLE public.recipe_ingredients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  recipe_id UUID NOT NULL REFERENCES public.recipes(id) ON DELETE CASCADE,
  sort_order INTEGER NOT NULL DEFAULT 0,
  ingredient_name TEXT NOT NULL,
  quantity NUMERIC(7,2),
  unit TEXT,
  nutrition_note TEXT,
  is_trigger_food BOOLEAN DEFAULT false,
  is_optional BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE public.recipe_ingredients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view all recipe ingredients"
  ON public.recipe_ingredients FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert ingredients for own recipes"
  ON public.recipe_ingredients FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.recipes
      WHERE id = recipe_id AND created_by = auth.uid() AND is_seed = false
    )
  );

CREATE POLICY "Users can update ingredients for own recipes"
  ON public.recipe_ingredients FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.recipes
      WHERE id = recipe_id AND created_by = auth.uid() AND is_seed = false
    )
  );

CREATE POLICY "Users can delete ingredients for own recipes"
  ON public.recipe_ingredients FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.recipes
      WHERE id = recipe_id AND created_by = auth.uid() AND is_seed = false
    )
  );

CREATE INDEX recipe_ingredients_recipe_id_idx ON public.recipe_ingredients(recipe_id);

-- meal_plans
CREATE TABLE public.meal_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  week_start_date DATE NOT NULL,
  name TEXT,
  notes TEXT,
  avg_daily_protein_g NUMERIC(6,2),
  avg_daily_calories NUMERIC(7,2),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(user_id, week_start_date)
);

ALTER TABLE public.meal_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own meal plans"
  ON public.meal_plans FOR ALL
  USING (auth.uid() = user_id);

CREATE INDEX meal_plans_user_id_idx ON public.meal_plans(user_id);
CREATE INDEX meal_plans_week_start_idx ON public.meal_plans(week_start_date);

CREATE TRIGGER meal_plans_updated_at
  BEFORE UPDATE ON public.meal_plans
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- meal_plan_entries
CREATE TABLE public.meal_plan_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  meal_plan_id UUID NOT NULL REFERENCES public.meal_plans(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  day_of_week SMALLINT NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  meal_slot TEXT NOT NULL CHECK (meal_slot IN ('breakfast','snack_am','lunch','snack_pm','dinner')),
  recipe_id UUID REFERENCES public.recipes(id) ON DELETE SET NULL,
  custom_entry_name TEXT,
  servings NUMERIC(4,2) DEFAULT 1.0,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE public.meal_plan_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own meal plan entries"
  ON public.meal_plan_entries FOR ALL
  USING (auth.uid() = user_id);

CREATE INDEX meal_plan_entries_plan_id_idx ON public.meal_plan_entries(meal_plan_id);
CREATE INDEX meal_plan_entries_user_id_idx ON public.meal_plan_entries(user_id);

CREATE TRIGGER meal_plan_entries_updated_at
  BEFORE UPDATE ON public.meal_plan_entries
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- food_diary_entries
CREATE TABLE public.food_diary_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  entry_date DATE NOT NULL,
  meal_slot TEXT NOT NULL CHECK (meal_slot IN ('breakfast','snack_am','lunch','snack_pm','dinner','other')),
  recipe_id UUID REFERENCES public.recipes(id) ON DELETE SET NULL,
  custom_food_name TEXT,
  servings_consumed NUMERIC(4,2) DEFAULT 1.0,
  calories NUMERIC(7,2),
  protein_g NUMERIC(6,2),
  carbs_g NUMERIC(6,2),
  fat_g NUMERIC(6,2),
  fiber_g NUMERIC(6,2),
  magnesium_mg NUMERIC(6,2),
  vitamin_d_iu NUMERIC(7,2),
  calcium_mg NUMERIC(6,2),
  omega3_g NUMERIC(5,2),
  b12_mcg NUMERIC(5,2),
  contains_triggers BOOLEAN DEFAULT false,
  trigger_notes TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE public.food_diary_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own diary entries"
  ON public.food_diary_entries FOR ALL
  USING (auth.uid() = user_id);

CREATE INDEX food_diary_entries_user_id_idx ON public.food_diary_entries(user_id);
CREATE INDEX food_diary_entries_date_idx ON public.food_diary_entries(entry_date);
CREATE INDEX food_diary_entries_user_date_idx ON public.food_diary_entries(user_id, entry_date);

CREATE TRIGGER food_diary_entries_updated_at
  BEFORE UPDATE ON public.food_diary_entries
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- symptom_logs
CREATE TABLE public.symptom_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  symptom_date DATE NOT NULL,
  symptom_time TIME,
  symptom_type TEXT NOT NULL CHECK (symptom_type IN ('motor','sensory','cognitive','fatigue','mood','seizure','speech','pain','other')),
  symptom_name TEXT NOT NULL,
  severity SMALLINT NOT NULL CHECK (severity BETWEEN 1 AND 10),
  duration_minutes INTEGER,
  potential_triggers JSONB DEFAULT '[]',
  food_related BOOLEAN DEFAULT false,
  notes TEXT,
  energy_level SMALLINT CHECK (energy_level BETWEEN 1 AND 5),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE public.symptom_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own symptom logs"
  ON public.symptom_logs FOR ALL
  USING (auth.uid() = user_id);

CREATE INDEX symptom_logs_user_id_idx ON public.symptom_logs(user_id);
CREATE INDEX symptom_logs_date_idx ON public.symptom_logs(symptom_date);
CREATE INDEX symptom_logs_user_date_idx ON public.symptom_logs(user_id, symptom_date);
CREATE INDEX symptom_logs_type_idx ON public.symptom_logs(symptom_type);
CREATE INDEX symptom_logs_triggers_idx ON public.symptom_logs USING GIN (potential_triggers);

CREATE TRIGGER symptom_logs_updated_at
  BEFORE UPDATE ON public.symptom_logs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
