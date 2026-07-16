// ============================================================================
// Nutrition Module Types
// ============================================================================

export interface UserHealthProfile {
  id: string;
  user_id: string;
  weight_kg: number | null;
  height_cm: number | null;
  date_of_birth: string | null;
  sex: 'male' | 'female' | 'non_binary' | 'prefer_not_to_say' | null;
  protein_target_g: number | null;
  dietary_restrictions: string[];
  fnd_symptoms: string[];
  health_goals: string[];
  known_triggers: string[];
  magnesium_target_mg: number;
  vitamin_d_target_iu: number;
  calcium_target_mg: number;
  omega3_target_g: number;
  b12_target_mcg: number;
  onboarding_completed: boolean;
  created_at: string;
  updated_at: string;
}

export interface Recipe {
  id: string;
  name: string;
  slug: string;
  description: string;
  meal_type: MealType;
  dietary_tags: string[];
  fnd_benefits: string[];
  trigger_free: string[];
  prep_time_minutes: number;
  cook_time_minutes: number;
  total_time_minutes: number;
  servings: number;
  difficulty: 'easy' | 'medium' | 'hard';
  instructions: string[];
  fnd_notes: string | null;
  image_url: string | null;
  calories_per_serving: number | null;
  protein_g: number | null;
  carbs_g: number | null;
  fat_g: number | null;
  fiber_g: number | null;
  magnesium_mg: number | null;
  vitamin_d_iu: number | null;
  calcium_mg: number | null;
  omega3_g: number | null;
  b12_mcg: number | null;
  is_seed: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  ingredients?: RecipeIngredient[];
}

export interface RecipeIngredient {
  id: string;
  recipe_id: string;
  sort_order: number;
  ingredient_name: string;
  quantity: number | null;
  unit: string | null;
  nutrition_note: string | null;
  is_trigger_food: boolean;
  is_optional: boolean;
  created_at: string;
}

export interface MealPlan {
  id: string;
  user_id: string;
  week_start_date: string;
  name: string | null;
  notes: string | null;
  avg_daily_protein_g: number | null;
  avg_daily_calories: number | null;
  created_at: string;
  updated_at: string;
  entries?: MealPlanEntry[];
}

export interface MealPlanEntry {
  id: string;
  meal_plan_id: string;
  user_id: string;
  day_of_week: number;
  meal_slot: MealSlot;
  recipe_id: string | null;
  custom_entry_name: string | null;
  servings: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
  recipe?: Recipe;
}

export interface FoodDiaryEntry {
  id: string;
  user_id: string;
  entry_date: string;
  meal_slot: MealSlotExtended;
  recipe_id: string | null;
  custom_food_name: string | null;
  servings_consumed: number;
  calories: number | null;
  protein_g: number | null;
  carbs_g: number | null;
  fat_g: number | null;
  fiber_g: number | null;
  magnesium_mg: number | null;
  vitamin_d_iu: number | null;
  calcium_mg: number | null;
  omega3_g: number | null;
  b12_mcg: number | null;
  contains_triggers: boolean;
  trigger_notes: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  recipe?: Recipe;
}

export interface SymptomLog {
  id: string;
  user_id: string;
  symptom_date: string;
  symptom_time: string | null;
  symptom_type: SymptomType;
  symptom_name: string;
  severity: number;
  duration_minutes: number | null;
  potential_triggers: string[];
  food_related: boolean;
  notes: string | null;
  energy_level: number | null;
  created_at: string;
  updated_at: string;
}

// Utility types
export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'dessert';
export type MealSlot = 'breakfast' | 'snack_am' | 'lunch' | 'snack_pm' | 'dinner';
export type MealSlotExtended = MealSlot | 'other';
export type SymptomType =
  'motor' | 'sensory' | 'cognitive' | 'fatigue' | 'mood' | 'seizure' | 'speech' | 'pain' | 'other';

export interface DailyNutritionSummary {
  date: string;
  total_calories: number;
  total_protein_g: number;
  total_carbs_g: number;
  total_fat_g: number;
  total_fiber_g: number;
  total_magnesium_mg: number;
  total_vitamin_d_iu: number;
  total_calcium_mg: number;
  total_omega3_g: number;
  total_b12_mcg: number;
  entry_count: number;
  has_trigger_foods: boolean;
}

export interface NutrientGoalProgress {
  nutrient: string;
  label: string;
  current: number;
  target: number;
  unit: string;
  percentage: number;
}

export interface RecipeFilters {
  meal_type?: MealType;
  max_time?: number;
  min_protein?: number;
  dietary_tags?: string[];
  trigger_free?: string[];
  difficulty?: 'easy' | 'medium' | 'hard';
  search?: string;
}

export interface SymptomCorrelation {
  trigger: string;
  avg_severity: number;
  occurrence_count: number;
  most_common_symptom: string;
}

export const MEAL_SLOT_LABELS: Record<MealSlotExtended, string> = {
  breakfast: 'Breakfast',
  snack_am: 'Morning Snack',
  lunch: 'Lunch',
  snack_pm: 'Afternoon Snack',
  dinner: 'Dinner',
  other: 'Other',
};

export const SYMPTOM_TYPE_LABELS: Record<SymptomType, string> = {
  motor: 'Motor',
  sensory: 'Sensory',
  cognitive: 'Cognitive',
  fatigue: 'Fatigue',
  mood: 'Mood',
  seizure: 'Seizure',
  speech: 'Speech',
  pain: 'Pain',
  other: 'Other',
};

export const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export const DIETARY_RESTRICTION_OPTIONS = [
  { value: 'dairy_free', label: 'Dairy Free' },
  { value: 'gluten_free', label: 'Gluten Free' },
  { value: 'fodmap_friendly', label: 'Low FODMAP' },
  { value: 'nut_free', label: 'Nut Free' },
  { value: 'soy_free', label: 'Soy Free' },
  { value: 'egg_free', label: 'Egg Free' },
];

export const FND_SYMPTOM_OPTIONS = [
  { value: 'motor', label: 'Motor symptoms' },
  { value: 'fatigue', label: 'Chronic fatigue' },
  { value: 'cognitive', label: 'Cognitive difficulties' },
  { value: 'sensory', label: 'Sensory issues' },
  { value: 'seizure', label: 'Non-epileptic seizures' },
  { value: 'speech', label: 'Speech difficulties' },
  { value: 'pain', label: 'Chronic pain' },
  { value: 'mood', label: 'Mood changes' },
];

export const HEALTH_GOAL_OPTIONS = [
  { value: 'reduce_inflammation', label: 'Reduce inflammation' },
  { value: 'increase_protein', label: 'Increase protein intake' },
  { value: 'improve_gut_health', label: 'Improve gut health' },
  { value: 'boost_energy', label: 'Boost energy levels' },
  { value: 'support_brain', label: 'Support brain health' },
  { value: 'bone_health', label: 'Improve bone health' },
];

export const TRIGGER_FOOD_OPTIONS = [
  { value: 'dairy', label: 'Dairy' },
  { value: 'gluten', label: 'Gluten' },
  { value: 'caffeine', label: 'Caffeine' },
  { value: 'alcohol', label: 'Alcohol' },
  { value: 'fodmap', label: 'High FODMAP foods' },
  { value: 'sugar', label: 'Refined sugar' },
  { value: 'processed', label: 'Processed foods' },
];
