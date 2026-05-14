import React, { useEffect, useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { Search, Dice5, Clock, Star } from 'lucide-react';
import { RecipeCard } from '../components/RecipeCard';
import { Recipe } from '../types';

export function Home() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const recipesRef = React.useRef<HTMLElement>(null);
  const category = searchParams.get('category');
  const q = searchParams.get('q');
  
  const displayToQueryMap: Record<string, string> = {
    "Quick Meals": "15-minutes-or-less",
    "North American": "north-american",
    "Dinner Ideas": "main-dish",
    "Desserts": "dessert"
  };
  
  const backendCategory = category ? (displayToQueryMap[category] || category) : null;
  
  useEffect(() => {
    const userId = localStorage.getItem('user_id');
    if (userId) {
      fetch(`http://localhost:8000/api/users/${userId}/favorites`)
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) setFavoriteIds(data.map(String));
        })
        .catch(err => console.error(err));
    }
  }, []);

  useEffect(() => {
    const userId = localStorage.getItem('user_id') || '1';
    let url = `http://localhost:8000/api/recipes?limit=30`;
    let isRecommendation = false;
    
    if (backendCategory) {
      url += `&category=${encodeURIComponent(backendCategory)}`;
    } else if (q) {
      url += `&q=${encodeURIComponent(q)}`;
    } else {
      url = `http://localhost:8000/api/recommendations/${userId}`;
      isRecommendation = true;
    }
      
    fetch(url)
      .then(res => res.json())
      .then(data => {
        // Limit recommendations to 30
        if (isRecommendation && Array.isArray(data)) {
          setRecipes(data.slice(0, 30));
        } else {
          setRecipes(data);
        }
        if (q || backendCategory) {
          setTimeout(() => {
            recipesRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }, 100);
        }
      })
      .catch(err => console.error("Error fetching recipes:", err));
  }, [backendCategory, q]);

  return (
    <div className="space-y-16 pb-20">
      {/* Hero Section */}
      <section className="relative w-full h-[500px] rounded-xl overflow-hidden group">
        <img 
          src="https://images.unsplash.com/photo-1466637574441-749b8f19452f?q=80&w=2080&auto=format&fit=crop"
          alt="Slow Roast"
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-on-surface/80 via-on-surface/40 to-transparent"></div>
        
        <div className="relative h-full flex flex-col justify-center px-12 max-w-3xl">
          <span className="text-secondary-container text-sm font-bold tracking-[0.2em] uppercase mb-4 font-body">
            Seasonal Feature
          </span>
          <h1 className="text-white text-5xl md:text-7xl font-headline font-bold mb-8 leading-tight italic">
            The Art of the Slow Roast
          </h1>
          
          <div className="relative max-w-xl">
            <input 
              type="text" 
              id="hero-search"
              placeholder="What's for dinner today?"
              className="w-full py-4 px-6 pr-16 bg-surface/95 backdrop-blur-sm rounded-full text-on-surface border-none shadow-xl focus:ring-2 focus:ring-primary transition-all"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && e.currentTarget.value) {
                  navigate(`/?q=${e.currentTarget.value}`);
                }
              }}
            />
            <button 
              onClick={() => {
                const val = (document.getElementById('hero-search') as HTMLInputElement)?.value;
                if (val) navigate(`/?q=${val}`);
              }}
              className="absolute right-2 top-2 bottom-2 bg-primary text-on-primary px-6 rounded-full flex items-center justify-center hover:bg-primary-container transition-colors">
              <Search className="w-5 h-5" />
            </button>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section>
        <div className="flex items-end gap-2 mb-8">
          <span className="text-secondary font-bold text-sm uppercase">Curated Collections</span>
          <h2 className="text-3xl font-headline font-bold text-on-surface italic">Explore by Category</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {['Vegetarian', 'Quick Meals', 'Dinner Ideas', 'Desserts'].map((cat) => (
            <Link key={cat} to={`/?category=${cat}`} className="group cursor-pointer block">
              <div className="aspect-square bg-surface-container-low rounded-xl flex flex-col items-center justify-center gap-4 transition-all hover:bg-secondary-container hover:-translate-y-1">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm">
                  <Star className="w-8 h-8 text-secondary" />
                </div>
                <span className="font-bold font-body text-on-surface-variant">{cat}</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Surprise Me */}
      <section className="flex flex-col items-center justify-center py-12 px-8 bg-surface-container-low rounded-xl border border-outline-variant/10 text-center space-y-6">
        <div className="space-y-2">
          <h2 className="text-3xl font-headline italic text-on-surface">Indecisive? Let us choose.</h2>
          <p className="text-on-surface-variant font-body">Roll the dice and discover a new favorite from our curated vault.</p>
        </div>
        <button 
          onClick={() => {
            const userId = localStorage.getItem('user_id');
            const query = userId ? `?user_id=${userId}` : '';
            fetch(`http://localhost:8000/api/recipes/random${query}`)
              .then(res => res.json())
              .then(data => {
                if (data && data.id) {
                  navigate(`/recipe/${data.id}`);
                }
              })
              .catch(err => console.error(err));
          }}
          className="group flex items-center gap-3 bg-secondary text-on-secondary px-10 py-4 rounded-full font-bold transition-all hover:shadow-lg active:scale-95">
          <Dice5 className="w-6 h-6 transition-transform group-hover:rotate-180 duration-500" />
          Surprise Me
        </button>
      </section>

      {/* Recommended For You / Filtered Items */}
      <section className="bg-surface-container-low rounded-3xl p-12" id="recipes-section" ref={recipesRef}>
        <div className="mb-10 text-center max-w-2xl mx-auto">
          <span className="text-primary font-bold text-sm uppercase tracking-widest">
            {category ? "Category View" : q ? "Search Results" : "Personalized Selection"}
          </span>
          <h2 className="text-4xl font-headline font-bold text-on-surface mt-2 italic">
            {category ? `Recipes in "${category}"` : q ? `Search matching "${q}"` : "Recommended For You"}
          </h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {recipes.map(recipe => (
            <RecipeCard key={recipe.id} recipe={recipe} initialIsFavorite={favoriteIds.includes(String(recipe.id))} />
          ))}
        </div>
      </section>
    </div>
  );
}
