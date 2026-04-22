from services.recommender import RecommenderService
r = RecommenderService("lightfm_model.pkl", "recipes_processed.pkl", "mappings.pkl", "interactions_matrix.npz")
print("Model loaded?", r.model is not None)
print("Item embeddings?", hasattr(r.model, 'item_embeddings'))
