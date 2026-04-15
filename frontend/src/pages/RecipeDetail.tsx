import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Clock, Star, Utensils, Bookmark, Share2, CheckCircle2, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { Recipe } from '../types';

export function RecipeDetail() {
  const { id } = useParams();
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [ratingStats, setRatingStats] = useState({ average_rating: 0, total_reviews: 0, user_rating: 0 });
  const [hoverRating, setHoverRating] = useState(0);

  useEffect(() => {
    const userId = localStorage.getItem('user_id') || '1';
    fetch(`http://localhost:8000/api/users/${userId}/favorites`)
      .then(res => res.json())
      .then(data => {
        if (data && id && data.includes(id.toString())) {
          setIsFavorite(true);
        }
      });
  }, [id]);

  const toggleFavorite = () => {
    const userId = localStorage.getItem('user_id');
    const token = localStorage.getItem('auth_token');
    
    if (!userId || !token) {
      toast.error('Favorilere eklemek için önce giriş yapmalısınız.');
      return;
    }

    fetch(`http://localhost:8000/api/users/${userId}/favorites/${id}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
      .then(res => {
        if (res.status === 401) {
             localStorage.clear();
             window.location.href = '/login';
             throw new Error("Oturum süreniz doldu. Lütfen tekrar giriş yapın.");
        }
        if (!res.ok) throw new Error("Favoriye eklenemedi");
        return res.json();
      })
      .then(data => {
        const added = data.status === 'added';
        setIsFavorite(added);
        if (added) {
          toast.success("Tarif favorilere eklendi");
        } else {
          toast.success("Tarif favorilerden çıkarıldı");
        }
      })
      .catch(err => toast.error(err.message));
  };

  useEffect(() => {
    setLoading(true);
    // Fetch recipe details
    fetch(`http://localhost:8000/api/recipes/${id}`)
      .then(res => res.json())
      .then(data => {
        if (data && !data.detail) {
          setRecipe(data);
        }
      })
      .catch(err => console.error(err));

    // Fetch ratings
    const userId = localStorage.getItem('user_id');
    const query = userId ? `?user_id=${userId}` : '';
    fetch(`http://localhost:8000/api/recipes/${id}/ratings${query}`)
      .then(res => res.json())
      .then(data => {
        if (!data.detail) {
          setRatingStats(data);
        }
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, [id]);

  const handleRate = (score: number) => {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      toast.error('Puan vermek için giriş yapmalısınız.');
      return;
    }

    fetch(`http://localhost:8000/api/recipes/${id}/rate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ score })
    })
      .then(res => {
        if (res.status === 401) {
             localStorage.clear();
             window.location.href = '/login';
             throw new Error("Oturum süreniz doldu. Lütfen tekrar giriş yapın.");
        }
        if (!res.ok) throw new Error("Puan kaydedilemedi");
        return res.json();
      })
      .then(() => {
        toast.success("Puanınız kaydedildi!");
        setRatingStats(prev => ({ ...prev, user_rating: score }));
        // Silently refresh average rating
        const userId = localStorage.getItem('user_id');
        fetch(`http://localhost:8000/api/recipes/${id}/ratings?user_id=${userId}`)
          .then(res => res.json())
          .then(data => setRatingStats(data));
      })
      .catch(err => toast.error(err.message));
  };

  if (loading) {
    return <div className="flex h-96 items-center justify-center"><Loader2 className="w-10 h-10 animate-spin text-primary" /></div>;
  }

  if (!recipe) {
    return <div className="text-center py-20 text-on-surface text-xl">Recipe not found</div>;
  }

  return (
    <div className="pb-12">
      {/* Hero Section */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start mb-20">
        <div className="lg:col-span-7 relative">
          <div className="aspect-[4/3] rounded-xl overflow-hidden shadow-sm">
            <img 
              src={recipe.image} 
              alt={recipe.title}
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
          {/* Nutrition Badge */}
          <div className="absolute -bottom-6 -right-6 hidden lg:block bg-secondary-container text-on-secondary-container p-6 rounded-xl shadow-lg border border-white/20">
            <div className="text-xs font-bold uppercase tracking-widest mb-1 opacity-70">Nutrition per serving</div>
            <div className="text-3xl font-headline italic">{recipe.calories} kcal</div>
            <div className="flex gap-4 mt-2 text-sm font-medium">
              <span>{recipe.protein} Protein</span>
              <span>{recipe.carbs} Carbs</span>
            </div>
          </div>
        </div>

        <div className="lg:col-span-5 lg:pt-12">
          <span className="font-body text-secondary font-bold text-xs uppercase tracking-[0.2em] mb-4 block">
            {recipe.category}
          </span>
          <h1 className="text-5xl lg:text-7xl font-headline italic text-on-surface mb-6 leading-tight">
            {recipe.title}
          </h1>
          
          <div className="flex flex-wrap gap-6 mb-8 items-center text-sm font-medium text-on-surface-variant">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-primary" />
              <span>{recipe.prepTime}</span>
            </div>
            <div className="flex items-center gap-2 border-l border-outline-variant/30 pl-6">
              <Utensils className="w-4 h-4 text-primary" />
              <span>{recipe.difficulty}</span>
            </div>
            <div className="flex items-center gap-1 border-l border-outline-variant/30 pl-6 relative group">
              <div className="flex items-center">
                {[1, 2, 3, 4, 5].map(star => (
                   <Star 
                     key={star} 
                     onClick={() => handleRate(star)}
                     onMouseEnter={() => setHoverRating(star)}
                     onMouseLeave={() => setHoverRating(0)}
                     className={`w-5 h-5 cursor-pointer transition-colors ${
                       (hoverRating || ratingStats.user_rating) >= star 
                         ? 'fill-primary text-primary' 
                         : 'text-outline-variant hover:text-primary'
                     }`} 
                   />
                ))}
              </div>
              <div className="flex flex-col ml-2">
                <div className="flex items-center gap-1">
                  <span className="font-bold text-on-surface">{ratingStats.average_rating || recipe.rating}</span>
                  <span className="text-secondary text-xs">Ağırlıklı Puan</span>
                </div>
                <span className="opacity-60 text-xs">({ratingStats.total_reviews || recipe.reviews} değerlendirme)</span>
              </div>
            </div>
          </div>

          <p className="text-lg text-on-surface-variant leading-relaxed mb-8">
            {recipe.description}
          </p>

          <div className="flex gap-4">
            <button 
              onClick={toggleFavorite}
              className={`${isFavorite ? 'bg-primary text-on-primary' : 'bg-surface-container text-on-surface'} px-8 py-4 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-primary/20 active:scale-95 transition-all`}>
              <Bookmark className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
              {isFavorite ? 'Saved to Favorites' : 'Save Recipe'}
            </button>
            <button className="bg-surface-container text-on-surface px-8 py-4 rounded-xl font-bold hover:bg-surface-container-high transition-colors">
              <Share2 className="w-5 h-5" />
            </button>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Sidebar: Ingredients */}
        <aside className="lg:col-span-4 bg-surface-container-low rounded-xl p-8 sticky top-24 h-fit">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-2xl font-headline italic">Ingredients</h3>
            <div className="text-xs bg-white px-3 py-1 rounded-full text-secondary font-bold uppercase tracking-wider">4 Servings</div>
          </div>
          <ul className="space-y-4">
            {recipe.ingredients.map((ing, i) => (
              <li key={i} className="flex items-start gap-3 group cursor-pointer">
                <div className="w-5 h-5 rounded border-2 border-outline-variant group-hover:border-primary transition-colors mt-0.5"></div>
                <span className="text-on-surface-variant font-body">{ing}</span>
              </li>
            ))}
          </ul>
        </aside>

        {/* Main Content: Instructions */}
        <div className="lg:col-span-8 space-y-12">
          <section>
            <h3 className="text-3xl font-headline italic mb-8 flex items-center gap-4">
              Preparation steps
              <span className="h-px flex-1 bg-outline-variant/30"></span>
            </h3>
            <div className="space-y-10">
              {recipe.steps.map((step, i) => {
                const [title, content] = step.split(': ');
                return (
                  <div key={i} className="flex gap-8 group">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center font-headline text-2xl italic text-primary shadow-sm border border-surface-container">
                        {i + 1}
                      </div>
                    </div>
                    <div>
                      <h4 className="text-xl font-headline mb-3 text-on-surface italic">{title}</h4>
                      <p className="text-on-surface-variant leading-relaxed font-body">
                        {content}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
