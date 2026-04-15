import pickle
import numpy as np
import pandas as pd
import ast
import random
from typing import List

try:
    import scipy.sparse as sp
except ImportError:
    sp = None

class RecommenderService:
    def __init__(self, model_path: str, dataset_path: str, mappings_path: str, interactions_path: str):
        self.model_path = model_path
        self.dataset_path = dataset_path
        self.mappings_path = mappings_path
        self.interactions_path = interactions_path

        self.load_artifacts()

    def load_artifacts(self):
        self.model = None
        self.recipes_df = None
        self.mappings = {}
        self.interactions = None
        self.idx_to_recipe_id = {}

        try:
            with open(self.dataset_path, "rb") as f:
                self.recipes_df = pickle.load(f)
        except Exception as e:
            print(f"Failed to load dataset: {e}")

        try:
            with open(self.mappings_path, "rb") as f:
                self.mappings = pickle.load(f)
            self.idx_to_recipe_id = self.mappings.get('idx_to_recipe_id', {})
        except Exception as e:
            print(f"Failed to load mappings: {e}")

        try:
            with open(self.model_path, "rb") as f:
                self.model = pickle.load(f)
        except Exception as e:
            print(f"Failed to load ML model: {e}")

        try:
            if sp is not None:
                self.interactions = sp.load_npz(self.interactions_path)
        except Exception as e:
            print(f"Failed to load interactions: {e}")
            
        print("Finished load_artifacts routine.")

    def _format_recipe(self, row) -> dict:
        # Default fallback values for missing stuff
        recipe_dict = dict(row)
        
        # steps parsing
        steps = recipe_dict.get('steps', [])
        if isinstance(steps, str):
            try:
                steps = ast.literal_eval(steps)
            except:
                steps = [steps]
                
        # ingredients
        ingredients = recipe_dict.get('ingredients', [])
        if isinstance(ingredients, str):
            try:
                ingredients = ast.literal_eval(ingredients)
            except:
                ingredients = [ingredients]
                
        # tags
        tags = recipe_dict.get('tags', [])
        if isinstance(tags, str):
            try:
                tags = ast.literal_eval(tags)
            except:
                tags = [tags]

        # nutrition: [calories, total fat, sugar, sodium, protein, saturated fat, carbs]
        nutrition = recipe_dict.get('nutrition', [0]*7)
        if isinstance(nutrition, str):
            try:
                nutrition = ast.literal_eval(nutrition)
            except:
                nutrition = [0]*7

        recipe_title = str(recipe_dict.get("name", "Unknown Recipe")).title()
        
        # Context-aware image mapping algorithm based on recipe name
        name_lower = recipe_title.lower()
        image_url = "https://images.unsplash.com/photo-1466637574441-749b8f19452f?auto=format&w=800" # Default slow roast
        
        keyword_maps = {
            ('chicken', 'poultry'): "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&w=800",
            ('pasta', 'spaghetti', 'macaroni', 'noodle'): "https://images.unsplash.com/photo-1473093226795-af9932fe5856?auto=format&w=800",
            ('beef', 'steak', 'burger', 'meat'): "https://images.unsplash.com/photo-1600891964092-4316c288032e?auto=format&w=800",
            ('salad', 'greens', 'spinach'): "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&w=800",
            ('cake', 'cookie', 'dessert', 'chocolate', 'sweet'): "https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&w=800",
            ('pizza', 'dough'): "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&w=800",
            ('soup', 'stew', 'chili', 'broth'): "https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&w=800",
            ('pork', 'bacon', 'sausage'): "https://images.unsplash.com/photo-1628294895950-9805252327bc?auto=format&w=800",
            ('fish', 'salmon', 'shrimp', 'seafood'): "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&w=800",
            ('bread', 'toast', 'loaf', 'bun'): "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&w=800",
            ('vegetable', 'vegan', 'carrot', 'potato'): "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&w=800"
        }
        
        for keywords, url in keyword_maps.items():
            if any(k in name_lower for k in keywords):
                image_url = url
                break

        return {
            "id": str(recipe_dict.get("id", "")),
            "title": recipe_title,
            "description": str(recipe_dict.get("description", "A delicious recipe.")),
            "image": image_url,
            "prepTime": f"{recipe_dict.get('minutes', 30)} mins",
            "difficulty": "Medium",
            "rating": round(random.uniform(4.0, 5.0), 1),
            "reviews": random.randint(10, 500),
            "calories": int(nutrition[0]) if len(nutrition) > 0 else 0,
            "protein": f"{nutrition[4]}g" if len(nutrition) > 4 else "0g",
            "carbs": f"{nutrition[6]}g" if len(nutrition) > 6 else "0g",
            "category": tags[0].title() if tags else "General",
            "ingredients": ingredients,
            "steps": steps,
            "tags": tags[:5]
        }

    def get_recommendations(self, user_external_id: int, num_items: int = 10, favorite_ids: List[str] = None, preferences: List[str] = None) -> List[dict]:
        user_external_id = int(user_external_id) if isinstance(user_external_id, str) and user_external_id.isdigit() else 1
        favorite_ids = favorite_ids or []
        preferences = preferences or []
        
        # 1. PRIMARY LOGIC: Content-based (Tag Matching) natively via favorites and preferences
        if isinstance(self.recipes_df, pd.DataFrame) and (favorite_ids or preferences):
            all_fav_tags = []
            
            if favorite_ids:
                fav_df = self.recipes_df[self.recipes_df['id'].astype(str).isin([str(x) for x in favorite_ids])]
                if not fav_df.empty:
                    for t in fav_df['tags']:
                        if isinstance(t, str):
                            try:
                                import ast
                                parsed = ast.literal_eval(t)
                                all_fav_tags.extend(parsed)
                            except:
                                all_fav_tags.append(t)
                        elif isinstance(t, list):
                            all_fav_tags.extend([str(x) for x in t])
            
            # Explicitly weight user preferences
            for pref in preferences:
                if pref.strip():
                    all_fav_tags.extend([pref.lower().strip()] * 5)
                
            from collections import Counter
            if all_fav_tags:
                # Ignore generic tags to find meaningful food categories
                ignore_tags = ['easy', 'preparation', 'time-to-make', 'course', 'main-ingredient', 'dietary', 'equipment', 'diet', 'technique', 'equipment', 'number-of-servings', '4-hours-or-less']
                top_tags = [tag for tag, _ in Counter(all_fav_tags).most_common(8) if tag.lower() not in ignore_tags]
                
                if not top_tags:
                    top_tags = [tag for tag, _ in Counter(all_fav_tags).most_common(3)]
                    
                if top_tags:
                    import re
                    pattern = '|'.join(map(re.escape, top_tags))
                    candidates = self.recipes_df[self.recipes_df['tags'].astype(str).str.contains(pattern, case=False, na=False)]
                    if favorite_ids:
                        candidates = candidates[~candidates['id'].astype(str).isin([str(x) for x in favorite_ids])]
                    
                    if not candidates.empty:
                        df_recs = candidates.sample(n=min(num_items, len(candidates)))
                        return [self._format_recipe(row) for _, row in df_recs.iterrows()]
        
        # 2. SECONDARY LOGIC: ML Collaborative Filtering (If model exists and no favorites yet)
        if self.model and self.interactions is not None:
            try:
                n_users, n_items = self.interactions.shape
                user_internal_id = user_external_id % n_users
                
                scores = self.model.predict(user_internal_id, np.arange(n_items))
                
                try:
                    known_positives = self.interactions.tocsr()[user_internal_id].indices
                    scores[known_positives] = -np.inf
                except:
                    pass
                
                top_items_internal = np.argsort(-scores)[:num_items]
                top_external_ids = [self.idx_to_recipe_id.get(i, i) for i in top_items_internal]
                
                if isinstance(self.recipes_df, pd.DataFrame):
                    df_recs = self.recipes_df[self.recipes_df['id'].isin(top_external_ids)]
                    return [self._format_recipe(row) for _, row in df_recs.iterrows()]
            except Exception as e:
                print(f"Error generating predictions: {e}")
                
        # 3. FALLBACK LOGIC: Random Seed based on User ID
        if isinstance(self.recipes_df, pd.DataFrame):
            np.random.seed(user_external_id)
            shuffled = self.recipes_df.sample(frac=1)
            df_recs = shuffled.head(num_items)
            return [self._format_recipe(row) for _, row in df_recs.iterrows()]
            
        return []
            
        return self.get_popular_recipes(num_items)

    def get_recipes(self, limit: int = 10, category: str = None, query: str = None) -> List[dict]:
        if isinstance(self.recipes_df, pd.DataFrame):
            df = self.recipes_df
            if category:
                df = df[df['tags'].astype(str).str.contains(category, case=False, na=False)]
            if query:
                search_term = query.lower()
                mask = (df['name'].astype(str).str.lower().str.contains(search_term, na=False)) | \
                       (df['description'].astype(str).str.lower().str.contains(search_term, na=False))
                df = df[mask]
            df_recs = df.head(limit)
            return [self._format_recipe(row) for _, row in df_recs.iterrows()]
        return []

    def get_popular_recipes(self, num_items: int = 10) -> List[dict]:
        return self.get_recipes(limit=num_items)
        
    def get_recipes_by_ids(self, recipe_ids: List[str]) -> List[dict]:
        if isinstance(self.recipes_df, pd.DataFrame) and recipe_ids:
            df_recs = self.recipes_df[self.recipes_df['id'].astype(str).isin([str(r) for r in recipe_ids])]
            return [self._format_recipe(row) for _, row in df_recs.iterrows()]
        return []

    def get_random_recipe(self) -> dict:
        if isinstance(self.recipes_df, pd.DataFrame) and not self.recipes_df.empty:
            df_rec = self.recipes_df.sample(n=1)
            return self._format_recipe(df_rec.iloc[0])
        return None

    def get_recipe(self, recipe_id: str) -> dict:
        if isinstance(self.recipes_df, pd.DataFrame):
            try:
                recipe_id_int = int(recipe_id)
            except:
                recipe_id_int = recipe_id
            df_rec = self.recipes_df[self.recipes_df['id'] == recipe_id_int]
            if not df_rec.empty:
                return self._format_recipe(df_rec.iloc[0])
        return None
