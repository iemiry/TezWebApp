import pickle
import numpy as np
import pandas as pd
import ast
import random
from typing import List
import ast
import random
import sys
import types
from typing import List

# --- MOCK LIGHTFM FOR WINDOWS NO-C++ INFERENCE ---
class MockLightFM:
    pass

class MockLightFMModule:
    LightFM = MockLightFM
    __all__ = ['LightFM']

if 'lightfm' not in sys.modules:
    sys.modules['lightfm'] = MockLightFMModule()
    sys.modules['lightfm.lightfm'] = MockLightFMModule()
# ------------------------------------------------

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
        
        # Context-aware image mapping algorithm based on requested specific categories
        name_lower = recipe_title.lower()
        image_url = "https://images.unsplash.com/photo-1466637574441-749b8f19452f?auto=format&w=800" # Default slow roast
        
        tags_str = " ".join([str(t).lower() for t in tags])
        
        category_image_map = {
            'vegetarian': "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&w=800",
            '15-minutes-or-less': "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&w=800",
            'quick meal': "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&w=800",
            'dessert': "https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&w=800",
            'healthy': "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?auto=format&w=800",
            'north-american': "https://images.unsplash.com/photo-1600891964092-4316c288032e?auto=format&w=800",
            'north american': "https://images.unsplash.com/photo-1600891964092-4316c288032e?auto=format&w=800",
            'breakfast': "https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?auto=format&w=800",
            'main-dish': "https://images.unsplash.com/photo-1473093226795-af9932fe5856?auto=format&w=800",
            'dinner': "https://images.unsplash.com/photo-1473093226795-af9932fe5856?auto=format&w=800",
            'baking': "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&w=800"
        }
        
        for cat_tag, url in category_image_map.items():
            if cat_tag in tags_str or cat_tag in name_lower:
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

    def get_recommendations(self, user_external_id: int, num_items: int = 10, favorite_ids: List[str] = None) -> List[dict]:
        user_external_id = int(user_external_id) if isinstance(user_external_id, str) and user_external_id.isdigit() else 1
        favorite_ids = favorite_ids or []
        
        # PRIMARY LOGIC: Model Latent Embedding Inference based on 10 interactions
        if self.model and favorite_ids:
            try:
                recipe_to_idx = {str(v): k for k, v in self.idx_to_recipe_id.items()}
                fav_internal_ids = [recipe_to_idx[str(fid)] for fid in favorite_ids if str(fid) in recipe_to_idx]
                
                if fav_internal_ids and hasattr(self.model, 'item_embeddings'):
                    item_embeddings = self.model.item_embeddings[fav_internal_ids]
                    
                    # Estimate User Vector by pooling their favored item embeddings
                    user_vector = np.mean(item_embeddings, axis=0)
                    
                    # Normalize vectors to use Cosine Similarity instead of raw Dot Product
                    # This prevents high-magnitude global items from dominating the recommendations forever
                    user_norm = np.linalg.norm(user_vector)
                    user_norm = user_norm if user_norm > 0 else 1e-10
                    normed_user = user_vector / user_norm
                    
                    item_norms = np.linalg.norm(self.model.item_embeddings, axis=1)
                    item_norms[item_norms == 0] = 1e-10
                    normed_items = self.model.item_embeddings / item_norms[:, np.newaxis]
                    
                    # Score all items (Cosine Similarity)
                    scores = np.dot(normed_user, normed_items.T)
                    
                    # Mask already favorited ones
                    scores[fav_internal_ids] = -np.inf
                    
                    # Top-K Sampling for Variety while remaining 100% LightFM
                    pool_size = min(150, len(scores))
                    top_items_internal_pool = np.argsort(-scores)[:pool_size]
                    
                    import random
                    if len(top_items_internal_pool) > num_items:
                        selected_indices = random.sample(range(len(top_items_internal_pool)), num_items)
                        selected_indices.sort() # Keep the highest scored ones at the top
                        top_items_internal = top_items_internal_pool[selected_indices]
                    else:
                        top_items_internal = top_items_internal_pool
                        
                    top_external_ids = [self.idx_to_recipe_id.get(i, i) for i in top_items_internal]
                    top_scores = scores[top_items_internal]
                    
                    if isinstance(self.recipes_df, pd.DataFrame):
                        recs = []
                        for ext_id, score in zip(top_external_ids, top_scores):
                            df_rec = self.recipes_df[self.recipes_df['id'].astype(str) == str(ext_id)]
                            if not df_rec.empty:
                                recipe_dict = self._format_recipe(df_rec.iloc[0])
                                # Cosine similarity to percentage (Optimistic bounded between 65% and 99%)
                                match_pct = min(max(int(score * 100), 65), 99)
                                recipe_dict['match_percentage'] = match_pct
                                recs.append(recipe_dict)
                        return recs
            except Exception as e:
                print(f"Error computing inference from LightFM embeddings: {e}")
                
        # FALLBACK: Explicit User Fallback (If no favorites parameter provided)
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
        if isinstance(self.recipes_df, pd.DataFrame) and not self.recipes_df.empty:
            df_recs = self.recipes_df.sample(n=min(num_items, len(self.recipes_df)))
            return [self._format_recipe(row) for _, row in df_recs.iterrows()]
        return self.get_recipes(limit=num_items)
        
    def get_recipes_by_preferences(self, preferences: List[str], num_items: int = 30) -> List[dict]:
        if not isinstance(self.recipes_df, pd.DataFrame) or self.recipes_df.empty or not preferences:
            return self.get_popular_recipes(num_items)
            
        mask = pd.Series([False] * len(self.recipes_df), index=self.recipes_df.index)
        
        for pref in preferences:
            search_term = pref.lower().strip()
            pref_mask = (
                self.recipes_df['tags'].astype(str).str.lower().str.contains(search_term, na=False) |
                self.recipes_df['ingredients'].astype(str).str.lower().str.contains(search_term, na=False) |
                self.recipes_df['name'].astype(str).str.lower().str.contains(search_term, na=False)
            )
            mask = mask | pref_mask
            
        df_filtered = self.recipes_df[mask]
        
        if df_filtered.empty:
            return self.get_popular_recipes(num_items)
            
        sample_size = min(num_items, len(df_filtered))
        df_recs = df_filtered.sample(n=sample_size)
        
        recs = []
        import random
        for _, row in df_recs.iterrows():
            recipe_dict = self._format_recipe(row)
            # Content-based match (Since it matched their strict tags, it's highly relevant)
            recipe_dict['match_percentage'] = random.randint(85, 98)
            recs.append(recipe_dict)
        
        if len(recs) < num_items:
            pad_needed = num_items - len(recs)
            recs.extend(self.get_popular_recipes(pad_needed))
            
        return recs
        
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
