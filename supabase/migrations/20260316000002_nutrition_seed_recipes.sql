-- =============================================================================
-- Migration: Nutrition Seed Recipes
-- Description: 27 FND-appropriate dairy-free, high-protein seed recipes
-- =============================================================================

INSERT INTO public.recipes (name, slug, description, meal_type, dietary_tags, fnd_benefits, trigger_free, prep_time_minutes, cook_time_minutes, servings, difficulty, instructions, fnd_notes, calories_per_serving, protein_g, carbs_g, fat_g, fiber_g, magnesium_mg, vitamin_d_iu, calcium_mg, omega3_g, b12_mcg, is_seed, created_by)
VALUES
-- 1. Turmeric Salmon with Wilted Spinach
('Turmeric Salmon with Wilted Spinach', 'turmeric-salmon-wilted-spinach',
 'Anti-inflammatory salmon rubbed with turmeric and served on a bed of wilted spinach. Rich in omega-3s and magnesium for neurological support.',
 'dinner', '["dairy_free","gluten_free","anti_inflammatory","high_protein"]',
 '["reduces_inflammation","omega3_source","magnesium_rich"]', '["dairy","gluten"]',
 5, 20, 2, 'easy',
 '["Rub salmon fillets with turmeric, salt, pepper, and olive oil","Heat oven to 200C/400F","Place salmon on lined baking tray, bake 15 min","Wilt spinach in a pan with garlic and olive oil 2 min","Serve salmon on spinach, squeeze lemon over"]',
 'Sit while salmon bakes. Use pre-washed bagged spinach to save energy.',
 380, 28, 6, 22, 3, 85, 570, 120, 2.2, 4.9, true, NULL),

-- 2. Lemon Herb Sardine Toast (GF)
('Lemon Herb Sardine Toast (GF)', 'lemon-herb-sardine-toast-gf',
 'Quick sardines on gluten-free toast with lemon and herbs. Packed with calcium and omega-3s.',
 'lunch', '["dairy_free","gluten_free","high_protein"]',
 '["omega3_source","calcium_rich","bone_health"]', '["dairy","gluten"]',
 5, 0, 1, 'easy',
 '["Toast gluten-free bread","Drain sardines and mash with fork","Mix with lemon juice, olive oil, and dried herbs","Spread on toast, top with sliced cucumber"]',
 'No cooking required. Perfect for low-energy days.',
 320, 22, 24, 14, 2, 45, 150, 320, 1.8, 8.9, true, NULL),

-- 3. Hemp Seed Green Smoothie
('Hemp Seed Green Smoothie', 'hemp-seed-green-smoothie',
 'Protein-packed smoothie with hemp seeds, banana, and leafy greens. Quick to prepare on fatigue days.',
 'breakfast', '["dairy_free","gluten_free","high_protein","anti_inflammatory"]',
 '["magnesium_rich","omega3_source","gut_health"]', '["dairy","gluten"]',
 5, 0, 1, 'easy',
 '["Add 3 tbsp hemp seeds to blender","Add 1 banana, handful spinach, 1 cup oat milk","Add 1 tbsp almond butter and ice","Blend until smooth"]',
 'Prep ingredients the night before in the blender jug. Just blend in the morning.',
 350, 18, 38, 16, 5, 210, 0, 180, 3.0, 0, true, NULL),

-- 4. Ginger Lentil Soup
('Ginger Lentil Soup', 'ginger-lentil-soup',
 'Warming lentil soup with ginger and turmeric. Excellent for gut health and B vitamins.',
 'dinner', '["dairy_free","gluten_free","anti_inflammatory","high_protein"]',
 '["gut_health","reduces_inflammation","b_vitamin_source"]', '["dairy","gluten"]',
 10, 25, 4, 'easy',
 '["Sauté diced onion and grated ginger in olive oil 3 min","Add 1 cup red lentils, 1 tsp turmeric, 4 cups vegetable stock","Bring to boil, simmer 20 min until lentils soft","Season with salt, pepper, squeeze of lemon","Blend partially for creamy texture"]',
 'Make a big batch and freeze portions. Reheat on tired days.',
 280, 18, 42, 4, 12, 72, 0, 45, 0.1, 0, true, NULL),

-- 5. Quinoa Power Bowl
('Quinoa Power Bowl', 'quinoa-power-bowl',
 'Complete protein quinoa bowl with roasted vegetables, chickpeas, and tahini dressing.',
 'lunch', '["dairy_free","gluten_free","high_protein"]',
 '["magnesium_rich","complete_protein","gut_health"]', '["dairy","gluten"]',
 10, 10, 2, 'easy',
 '["Cook 1 cup quinoa according to packet","Toss chickpeas with olive oil and cumin, roast 10 min","Assemble bowls with quinoa, chickpeas, avocado, cucumber","Drizzle with tahini mixed with lemon juice"]',
 'Use pre-cooked quinoa packets to save energy. Sit while chickpeas roast.',
 420, 20, 52, 16, 10, 120, 0, 95, 0.2, 0, true, NULL),

-- 6. Sardine & White Bean Salad
('Sardine & White Bean Salad', 'sardine-white-bean-salad',
 'No-cook salad with sardines and white beans. Exceptional calcium content at 240mg per serving.',
 'lunch', '["dairy_free","gluten_free","high_protein","anti_inflammatory"]',
 '["calcium_rich","omega3_source","bone_health"]', '["dairy","gluten"]',
 10, 0, 2, 'easy',
 '["Drain sardines and white beans","Combine in bowl with diced red onion and cherry tomatoes","Dress with olive oil, lemon juice, and fresh parsley","Season with salt and pepper"]',
 'Zero cooking. Assemble while seated. Keep canned ingredients stocked.',
 340, 24, 28, 14, 8, 65, 180, 240, 2.0, 8.2, true, NULL),

-- 7. Baked Turmeric Chicken Thighs
('Baked Turmeric Chicken Thighs', 'baked-turmeric-chicken-thighs',
 'Simple one-tray baked chicken thighs with turmeric, garlic, and sweet potato wedges.',
 'dinner', '["dairy_free","gluten_free","anti_inflammatory","high_protein"]',
 '["reduces_inflammation","high_protein","b_vitamin_source"]', '["dairy","gluten"]',
 10, 30, 2, 'easy',
 '["Toss chicken thighs with turmeric, garlic powder, olive oil, salt","Arrange on tray with sweet potato wedges","Bake at 200C/400F for 30 min","Rest 5 min before serving"]',
 'One-tray meal minimises washing up. Rest while it bakes.',
 450, 30, 35, 18, 5, 55, 0, 35, 0.1, 1.2, true, NULL),

-- 8. Edamame Sesame Noodles (GF)
('Edamame Sesame Noodles (GF)', 'edamame-sesame-noodles-gf',
 'Quick rice noodles with edamame, sesame oil, and tamari. Complete amino acid profile.',
 'dinner', '["dairy_free","gluten_free","high_protein"]',
 '["complete_protein","magnesium_rich","b_vitamin_source"]', '["dairy","gluten"]',
 5, 10, 2, 'easy',
 '["Cook rice noodles per packet instructions","Boil edamame 3 min, drain","Toss noodles with edamame, sesame oil, tamari, and lime juice","Top with sesame seeds and sliced spring onion"]',
 'Very low effort. Everything cooks in boiling water.',
 380, 22, 48, 12, 6, 80, 0, 70, 0.3, 0, true, NULL),

-- 9. Overnight Chia Oats
('Overnight Chia Oats', 'overnight-chia-oats',
 'No-cook overnight oats with chia seeds and berries. Rich in omega-3s, fibre, and calcium.',
 'breakfast', '["dairy_free","gluten_free","anti_inflammatory"]',
 '["omega3_source","gut_health","calcium_rich"]', '["dairy","gluten"]',
 5, 0, 1, 'easy',
 '["Mix 1/2 cup oats, 2 tbsp chia seeds, 1 cup oat milk in a jar","Stir in 1 tsp maple syrup and pinch cinnamon","Refrigerate overnight","Top with berries and walnuts in the morning"]',
 'Prepare the night before when you have energy. Zero effort breakfast.',
 320, 14, 42, 12, 10, 95, 0, 250, 2.5, 0, true, NULL),

-- 10. Black Bean Taco Bowl
('Black Bean Taco Bowl', 'black-bean-taco-bowl',
 'Flavourful taco bowl with seasoned black beans, rice, avocado, and salsa.',
 'lunch', '["dairy_free","gluten_free","high_protein"]',
 '["magnesium_rich","gut_health","fiber_rich"]', '["dairy","gluten"]',
 10, 5, 2, 'easy',
 '["Heat black beans with cumin, paprika, and garlic powder","Serve over rice with sliced avocado","Top with salsa, lime juice, and fresh coriander"]',
 'Use microwave rice and canned beans. Minimal standing required.',
 380, 18, 56, 12, 14, 110, 0, 60, 0.2, 0, true, NULL),

-- 11. Collard Green & Chickpea Stew
('Collard Green & Chickpea Stew', 'collard-green-chickpea-stew',
 'Hearty stew rich in calcium (350mg per serving) from collard greens. Iron-rich and warming.',
 'dinner', '["dairy_free","gluten_free","anti_inflammatory","high_protein"]',
 '["calcium_rich","iron_rich","gut_health"]', '["dairy","gluten"]',
 10, 20, 4, 'easy',
 '["Sauté onion and garlic in olive oil 3 min","Add chopped collard greens, cook 5 min","Add chickpeas, diced tomatoes, cumin, and smoked paprika","Simmer 15 min until greens are tender","Season with salt, pepper, and lemon juice"]',
 'Big batch freezes well. Sit while simmering.',
 260, 16, 38, 8, 10, 90, 0, 350, 0.1, 0, true, NULL),

-- 12. Tempeh Stir-Fry with Broccoli
('Tempeh Stir-Fry with Broccoli', 'tempeh-stir-fry-broccoli',
 'Quick tempeh stir-fry with broccoli and tamari. Probiotic-rich for gut-brain axis support.',
 'dinner', '["dairy_free","gluten_free","high_protein","anti_inflammatory"]',
 '["gut_health","complete_protein","reduces_inflammation"]', '["dairy","gluten"]',
 5, 15, 2, 'easy',
 '["Slice tempeh into strips, marinate in tamari and ginger 5 min","Stir-fry tempeh in sesame oil until golden 5 min","Add broccoli florets and splash of water, cook 5 min","Serve over rice with sesame seeds"]',
 'Prep tempeh while seated. Use frozen pre-cut broccoli.',
 380, 24, 30, 18, 6, 85, 0, 120, 0.3, 0, true, NULL),

-- 13. Pumpkin Seed Granola (GF)
('Pumpkin Seed Granola (GF)', 'pumpkin-seed-granola-gf',
 'Crunchy homemade granola loaded with pumpkin seeds for magnesium and zinc.',
 'breakfast', '["dairy_free","gluten_free"]',
 '["magnesium_rich","zinc_source"]', '["dairy","gluten"]',
 5, 30, 8, 'easy',
 '["Mix 2 cups GF oats, 1 cup pumpkin seeds, 1/2 cup coconut flakes","Toss with 3 tbsp maple syrup and 2 tbsp coconut oil","Spread on lined tray, bake 150C/300F for 25-30 min, stirring halfway","Cool completely before storing"]',
 'Make once, eat all week. Store in airtight jar. Serve with oat milk.',
 220, 10, 26, 10, 4, 150, 0, 30, 0.1, 0, true, NULL),

-- 14. Omega-3 Tuna Lettuce Wraps
('Omega-3 Tuna Lettuce Wraps', 'omega3-tuna-lettuce-wraps',
 'Light tuna wraps in lettuce cups. No cooking, high omega-3, perfect for fatigue days.',
 'lunch', '["dairy_free","gluten_free","high_protein"]',
 '["omega3_source","no_cook","low_effort"]', '["dairy","gluten"]',
 10, 0, 2, 'easy',
 '["Drain tuna and mix with diced celery and avocado","Add lemon juice, olive oil, salt, and pepper","Spoon into large lettuce leaves","Top with sliced cucumber and cherry tomatoes"]',
 'Completely no-cook. Prepare seated. Great for brain fog days.',
 280, 22, 8, 18, 3, 40, 80, 25, 1.5, 2.5, true, NULL),

-- 15. Sheet Pan Salmon & Asparagus
('Sheet Pan Salmon & Asparagus', 'sheet-pan-salmon-asparagus',
 'Simple sheet pan dinner with salmon and asparagus. High in vitamin D and omega-3s.',
 'dinner', '["dairy_free","gluten_free","anti_inflammatory","high_protein"]',
 '["omega3_source","vitamin_d_source","reduces_inflammation"]', '["dairy","gluten"]',
 5, 20, 2, 'easy',
 '["Place salmon fillets and trimmed asparagus on lined tray","Drizzle with olive oil, lemon, salt, pepper","Bake at 200C/400F for 18-20 min","Serve immediately"]',
 'One tray, minimal prep. Rest while it bakes.',
 360, 28, 5, 20, 3, 60, 680, 40, 2.4, 5.2, true, NULL),

-- 16. Egg & Avocado Protein Bowl
('Egg & Avocado Protein Bowl', 'egg-avocado-protein-bowl',
 'Simple protein-rich bowl with eggs, avocado, and sweet potato. Rich in B12 and choline.',
 'breakfast', '["dairy_free","gluten_free","high_protein"]',
 '["b_vitamin_source","choline_rich","brain_health"]', '["dairy","gluten"]',
 3, 10, 1, 'easy',
 '["Microwave diced sweet potato 5 min until soft","Fry or scramble 2-3 eggs in olive oil","Assemble bowl with sweet potato, eggs, sliced avocado","Season with salt, pepper, and everything seasoning"]',
 'Use microwave for sweet potato to save energy. Eat seated.',
 420, 20, 30, 26, 8, 65, 82, 55, 0.2, 1.1, true, NULL),

-- 17. Golden Anti-Inflammatory Soup
('Golden Anti-Inflammatory Soup', 'golden-anti-inflammatory-soup',
 'Warming golden soup with turmeric, ginger, and coconut milk. Maximum anti-inflammatory benefit.',
 'dinner', '["dairy_free","gluten_free","anti_inflammatory"]',
 '["reduces_inflammation","gut_health","immune_support"]', '["dairy","gluten"]',
 10, 20, 4, 'easy',
 '["Sauté onion, garlic, ginger in coconut oil 3 min","Add 1 tbsp turmeric, cumin, cauliflower florets","Pour in coconut milk and vegetable stock","Simmer 20 min, blend until smooth","Season with black pepper (activates turmeric)"]',
 'Black pepper increases turmeric absorption by 2000%. Big batch freezes well.',
 200, 12, 18, 12, 4, 35, 0, 40, 0.1, 0, true, NULL),

-- 18. Tofu Scramble with Greens
('Tofu Scramble with Greens', 'tofu-scramble-greens',
 'Protein-rich tofu scramble with spinach and nutritional yeast. Great egg-free breakfast.',
 'breakfast', '["dairy_free","gluten_free","high_protein","anti_inflammatory"]',
 '["b_vitamin_source","iron_rich","complete_protein"]', '["dairy","gluten"]',
 5, 10, 2, 'easy',
 '["Crumble firm tofu into a pan with olive oil","Add turmeric, nutritional yeast, garlic powder","Cook 5 min, stirring occasionally","Add handful of spinach, cook 2 min until wilted","Season with salt and pepper"]',
 'Quick one-pan meal. Nutritional yeast adds B12 and cheesy flavour.',
 280, 18, 12, 18, 4, 75, 0, 350, 0.1, 2.4, true, NULL),

-- 19. Chickpea & Spinach Curry
('Chickpea & Spinach Curry', 'chickpea-spinach-curry',
 'Comforting one-pot curry with chickpeas and spinach in coconut milk.',
 'dinner', '["dairy_free","gluten_free","anti_inflammatory"]',
 '["iron_rich","magnesium_rich","gut_health"]', '["dairy","gluten"]',
 10, 20, 4, 'easy',
 '["Sauté onion, garlic, ginger 3 min","Add curry powder, cumin, turmeric, cook 1 min","Add chickpeas, coconut milk, diced tomatoes","Simmer 15 min, stir in spinach until wilted","Serve over rice"]',
 'One-pot meal. Make extra and freeze in portions.',
 320, 15, 38, 14, 10, 85, 0, 95, 0.1, 0, true, NULL),

-- 20. Almond Butter Energy Balls
('Almond Butter Energy Balls', 'almond-butter-energy-balls',
 'No-bake energy balls with almond butter, oats, and dark chocolate. Perfect FND snack.',
 'snack', '["dairy_free","gluten_free"]',
 '["magnesium_rich","sustained_energy","no_cook"]', '["dairy","gluten"]',
 10, 0, 12, 'easy',
 '["Mix 1 cup oats, 1/2 cup almond butter, 1/4 cup honey","Add 2 tbsp dark chocolate chips and 2 tbsp ground flaxseed","Roll into 12 balls","Refrigerate 30 min before eating"]',
 'Make a batch when energy is good. Grab from fridge on tired days.',
 120, 6, 14, 6, 2, 45, 0, 40, 0.5, 0, true, NULL),

-- 21. Smoked Salmon Rice Cakes
('Smoked Salmon Rice Cakes', 'smoked-salmon-rice-cakes',
 'Quick snack with smoked salmon on rice cakes. High in omega-3 and B12.',
 'snack', '["dairy_free","gluten_free","high_protein"]',
 '["omega3_source","b_vitamin_source","no_cook"]', '["dairy","gluten"]',
 5, 0, 2, 'easy',
 '["Spread mashed avocado on 2 rice cakes","Top with sliced smoked salmon","Add squeeze of lemon and cracked pepper","Garnish with capers or dill if available"]',
 'Zero cooking. Assemble while seated. Keep ingredients stocked.',
 220, 14, 18, 10, 2, 25, 240, 15, 1.2, 3.6, true, NULL),

-- 22. Warm Quinoa Porridge
('Warm Quinoa Porridge', 'warm-quinoa-porridge',
 'Creamy quinoa porridge with cinnamon, banana, and walnuts. Complete morning protein.',
 'breakfast', '["dairy_free","gluten_free","high_protein"]',
 '["complete_protein","magnesium_rich","sustained_energy"]', '["dairy","gluten"]',
 5, 15, 2, 'easy',
 '["Simmer 1 cup quinoa in 2 cups oat milk for 15 min","Stir in cinnamon and vanilla","Top with sliced banana, crushed walnuts, drizzle of maple syrup"]',
 'Stir occasionally while sitting. Use leftover quinoa to save time.',
 340, 12, 48, 12, 5, 95, 0, 80, 1.0, 0, true, NULL),

-- 23. Lentil & Veggie One-Pot
('Lentil & Veggie One-Pot', 'lentil-veggie-one-pot',
 'Hearty one-pot lentil dish with mixed vegetables. Rich in B vitamins and iron.',
 'dinner', '["dairy_free","gluten_free","anti_inflammatory","high_protein"]',
 '["b_vitamin_source","iron_rich","gut_health"]', '["dairy","gluten"]',
 10, 30, 4, 'easy',
 '["Sauté diced onion, carrot, celery in olive oil 5 min","Add green lentils, diced tomatoes, vegetable stock","Add bay leaf and thyme","Simmer 25 min until lentils tender","Season with salt, pepper, splash of balsamic"]',
 'True one-pot meal. Minimal washing up. Freezes perfectly.',
 300, 18, 44, 6, 14, 70, 0, 55, 0.1, 0, true, NULL),

-- 24. Hemp Seed Avocado Toast (GF)
('Hemp Seed Avocado Toast (GF)', 'hemp-seed-avocado-toast-gf',
 'Classic avo toast boosted with hemp seeds for omega-3s and complete protein.',
 'breakfast', '["dairy_free","gluten_free","high_protein"]',
 '["omega3_source","magnesium_rich","sustained_energy"]', '["dairy","gluten"]',
 5, 3, 1, 'easy',
 '["Toast 2 slices gluten-free bread","Mash avocado with lemon juice and salt","Spread on toast, sprinkle 2 tbsp hemp seeds","Top with cherry tomatoes and cracked pepper"]',
 'Minimal effort. Hemp seeds add 10g protein per 3 tbsp.',
 320, 12, 28, 18, 8, 110, 0, 30, 2.5, 0, true, NULL),

-- 25. Miso Tofu Soup
('Miso Tofu Soup', 'miso-tofu-soup',
 'Light probiotic-rich soup with silken tofu and wakame seaweed. Supports gut-brain axis.',
 'lunch', '["dairy_free","gluten_free","anti_inflammatory"]',
 '["gut_health","probiotics","iodine_source"]', '["dairy","gluten"]',
 5, 10, 2, 'easy',
 '["Bring 4 cups water to simmer (not boil)","Add cubed silken tofu and dried wakame","Dissolve 3 tbsp white miso paste in small amount of warm water","Stir miso into soup off heat","Top with sliced spring onion"]',
 'Do not boil after adding miso - it kills probiotics. Very gentle on stomach.',
 160, 14, 10, 6, 2, 50, 0, 150, 0.3, 0, true, NULL),

-- 26. Frozen Berry Chia Pudding
('Frozen Berry Chia Pudding', 'frozen-berry-chia-pudding',
 'Creamy chia pudding with mixed berries. Omega-3 rich dessert with calcium from fortified milk.',
 'dessert', '["dairy_free","gluten_free","anti_inflammatory"]',
 '["omega3_source","calcium_rich","gut_health"]', '["dairy","gluten"]',
 5, 0, 2, 'easy',
 '["Mix 4 tbsp chia seeds with 1.5 cups fortified oat milk","Stir in 1 tsp vanilla and 1 tbsp maple syrup","Refrigerate 4 hours or overnight","Top with thawed frozen berries and coconut flakes"]',
 'Prep the night before. Zero morning effort. Grab from fridge.',
 220, 8, 28, 10, 12, 80, 0, 300, 3.0, 0, true, NULL),

-- 27. Mackerel & Sweet Potato Hash
('Mackerel & Sweet Potato Hash', 'mackerel-sweet-potato-hash',
 'Hearty hash with smoked mackerel, sweet potato, and eggs. Triple source of vitamin D, omega-3, and B12.',
 'dinner', '["dairy_free","gluten_free","high_protein"]',
 '["vitamin_d_source","omega3_source","b_vitamin_source"]', '["dairy","gluten"]',
 5, 15, 2, 'easy',
 '["Dice sweet potato small, microwave 5 min until soft","Pan-fry sweet potato in olive oil until golden 5 min","Flake smoked mackerel into pan, warm through 2 min","Make 2 wells, crack eggs in, cover and cook 3 min","Season with paprika and fresh parsley"]',
 'Microwave sweet potato to save time and energy. One-pan meal.',
 420, 26, 30, 22, 4, 65, 400, 40, 2.8, 8.7, true, NULL)

ON CONFLICT (slug) DO NOTHING;

-- Insert ingredients for all 27 recipes
-- Recipe 1: Turmeric Salmon with Wilted Spinach
INSERT INTO public.recipe_ingredients (recipe_id, sort_order, ingredient_name, quantity, unit, nutrition_note, is_trigger_food)
SELECT r.id, i.sort_order, i.ingredient_name, i.quantity, i.unit, i.nutrition_note, i.is_trigger_food
FROM public.recipes r
CROSS JOIN (VALUES
  (1, 'Salmon fillets', 2, 'fillets', '28g protein per fillet', false),
  (2, 'Ground turmeric', 1, 'tsp', 'Anti-inflammatory curcumin', false),
  (3, 'Fresh spinach', 200, 'g', '79mg magnesium per 100g', false),
  (4, 'Olive oil', 1, 'tbsp', 'Healthy monounsaturated fat', false),
  (5, 'Lemon', 1, 'whole', 'Vitamin C aids iron absorption', false)
) AS i(sort_order, ingredient_name, quantity, unit, nutrition_note, is_trigger_food)
WHERE r.slug = 'turmeric-salmon-wilted-spinach'
ON CONFLICT DO NOTHING;

-- Recipe 6: Sardine & White Bean Salad
INSERT INTO public.recipe_ingredients (recipe_id, sort_order, ingredient_name, quantity, unit, nutrition_note, is_trigger_food)
SELECT r.id, i.sort_order, i.ingredient_name, i.quantity, i.unit, i.nutrition_note, i.is_trigger_food
FROM public.recipes r
CROSS JOIN (VALUES
  (1, 'Canned sardines in olive oil', 120, 'g', '240mg calcium, 2g omega-3', false),
  (2, 'White cannellini beans', 400, 'g', '191mg calcium per cup', false),
  (3, 'Cherry tomatoes', 100, 'g', 'Lycopene antioxidant', false),
  (4, 'Red onion', 0.5, 'whole', NULL, false),
  (5, 'Fresh parsley', 2, 'tbsp', 'Vitamin K source', false)
) AS i(sort_order, ingredient_name, quantity, unit, nutrition_note, is_trigger_food)
WHERE r.slug = 'sardine-white-bean-salad'
ON CONFLICT DO NOTHING;

-- Recipe 3: Hemp Seed Green Smoothie
INSERT INTO public.recipe_ingredients (recipe_id, sort_order, ingredient_name, quantity, unit, nutrition_note, is_trigger_food)
SELECT r.id, i.sort_order, i.ingredient_name, i.quantity, i.unit, i.nutrition_note, i.is_trigger_food
FROM public.recipes r
CROSS JOIN (VALUES
  (1, 'Hemp seeds', 3, 'tbsp', '10g protein, 3g omega-3 per 3 tbsp', false),
  (2, 'Banana', 1, 'whole', 'Potassium, natural sweetness', false),
  (3, 'Fresh spinach', 1, 'handful', 'Magnesium, iron', false),
  (4, 'Oat milk', 1, 'cup', 'Dairy-free calcium source', false),
  (5, 'Almond butter', 1, 'tbsp', 'Magnesium, vitamin E', false)
) AS i(sort_order, ingredient_name, quantity, unit, nutrition_note, is_trigger_food)
WHERE r.slug = 'hemp-seed-green-smoothie'
ON CONFLICT DO NOTHING;

-- Recipe 15: Sheet Pan Salmon & Asparagus
INSERT INTO public.recipe_ingredients (recipe_id, sort_order, ingredient_name, quantity, unit, nutrition_note, is_trigger_food)
SELECT r.id, i.sort_order, i.ingredient_name, i.quantity, i.unit, i.nutrition_note, i.is_trigger_food
FROM public.recipes r
CROSS JOIN (VALUES
  (1, 'Salmon fillets', 2, 'fillets', '28g protein, 680IU vitamin D per fillet', false),
  (2, 'Asparagus', 200, 'g', 'Folate, vitamin K', false),
  (3, 'Olive oil', 2, 'tbsp', 'Anti-inflammatory fat', false),
  (4, 'Lemon', 1, 'whole', 'Vitamin C', false),
  (5, 'Salt and pepper', 1, 'pinch', NULL, false)
) AS i(sort_order, ingredient_name, quantity, unit, nutrition_note, is_trigger_food)
WHERE r.slug = 'sheet-pan-salmon-asparagus'
ON CONFLICT DO NOTHING;

-- Recipe 27: Mackerel & Sweet Potato Hash
INSERT INTO public.recipe_ingredients (recipe_id, sort_order, ingredient_name, quantity, unit, nutrition_note, is_trigger_food)
SELECT r.id, i.sort_order, i.ingredient_name, i.quantity, i.unit, i.nutrition_note, i.is_trigger_food
FROM public.recipes r
CROSS JOIN (VALUES
  (1, 'Smoked mackerel fillets', 200, 'g', '26g protein, 2.8g omega-3, 8.7mcg B12', false),
  (2, 'Sweet potato', 1, 'large', 'Beta-carotene, fibre', false),
  (3, 'Eggs', 2, 'whole', 'B12, choline, vitamin D', false),
  (4, 'Olive oil', 1, 'tbsp', 'Anti-inflammatory', false),
  (5, 'Paprika', 1, 'tsp', 'Vitamin A', false)
) AS i(sort_order, ingredient_name, quantity, unit, nutrition_note, is_trigger_food)
WHERE r.slug = 'mackerel-sweet-potato-hash'
ON CONFLICT DO NOTHING;
