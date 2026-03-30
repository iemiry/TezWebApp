import { Recipe, User } from './types';

export const MOCK_RECIPES: Recipe[] = [
  {
    id: '1',
    title: 'Mediterranean Quinoa Salad',
    description: 'A vibrant, protein-packed bowl of sun-soaked flavors. This recipe marries fluffy quinoa with crisp cucumbers, creamy feta, and a zesty lemon-herb vinaigrette that tastes like summer in a bowl.',
    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=2070&auto=format&fit=crop',
    prepTime: '25 mins',
    difficulty: 'Easy',
    rating: 4.9,
    reviews: 124,
    calories: 340,
    protein: '12g',
    carbs: '42g',
    category: 'Seasonal Kitchen',
    ingredients: [
      '1 cup White Quinoa, rinsed',
      '2 cups Vegetable Broth',
      '1 can Chickpeas, drained & rinsed',
      '1 large English Cucumber, diced',
      '1/2 cup Kalamata Olives, pitted',
      '150g Danish Feta, crumbled'
    ],
    steps: [
      'Cook the Quinoa: In a medium saucepan, bring quinoa and vegetable broth to a boil. Reduce heat to low, cover, and simmer for 15 minutes or until liquid is absorbed.',
      'Prepare the Vegetables: While the quinoa is cooking, dice the cucumber, halve the cherry tomatoes, and thinly slice the red onion.',
      'The Final Assembly: In a large editorial-style wooden bowl, combine the cooled quinoa, vegetables, chickpeas, and olives. Pour the lemon-herb dressing over the salad.'
    ],
    tags: ['Healthy', 'Vegan Option']
  },
  {
    id: '2',
    title: 'Classic Village Greek Salad',
    description: 'Authentic rustic salad featuring barrel-aged feta and sun-ripened tomatoes.',
    image: 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?q=80&w=1974&auto=format&fit=crop',
    prepTime: '15 mins',
    difficulty: 'Easy',
    rating: 4.9,
    reviews: 89,
    calories: 280,
    protein: '8g',
    carbs: '12g',
    category: 'Lunch',
    ingredients: [],
    steps: [],
    tags: ['Healthy']
  },
  {
    id: '3',
    title: 'Roasted Garlic Hummus Bowl',
    description: 'Velvety smooth chickpeas blended with charcoal-roasted garlic cloves.',
    image: 'https://images.unsplash.com/photo-1544148103-0773bf10d330?q=80&w=2070&auto=format&fit=crop',
    prepTime: '20 mins',
    difficulty: 'Easy',
    rating: 4.8,
    reviews: 56,
    calories: 210,
    protein: '6g',
    carbs: '25g',
    category: 'Appetizer',
    ingredients: [],
    steps: [],
    tags: ['Vegan']
  }
];

export const MOCK_USER: User = {
  name: 'Elena Rossi',
  role: 'Chef de Cuisine',
  bio: 'Passionate Home Cook. Creating modern twists on traditional Italian classics. Finding beauty in seasonal ingredients and shared meals.',
  avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=2070&auto=format&fit=crop',
  stats: {
    recipes: 124,
    followers: '3.8k',
    collections: 12
  }
};
