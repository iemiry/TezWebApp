export interface Recipe {
  id: string;
  title: string;
  description: string;
  image: string;
  prepTime: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  rating: number;
  reviews: number;
  calories: number;
  protein: string;
  carbs: string;
  category: string;
  ingredients: string[];
  steps: string[];
  tags: string[];
  match_percentage?: number;
}

export interface User {
  name: string;
  role: string;
  bio: string;
  avatar: string;
  stats: {
    recipes: number;
    followers: string;
    collections: number;
  };
}
