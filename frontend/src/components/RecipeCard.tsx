import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Star, Clock, Heart } from 'lucide-react';
import toast from 'react-hot-toast';
import { Recipe } from '../types';

interface RecipeCardProps {
  recipe: Recipe;
  initialIsFavorite?: boolean;
  key?: React.Key;
}

export function RecipeCard({ recipe, initialIsFavorite = false }: RecipeCardProps) {
  const [isFavorite, setIsFavorite] = useState(initialIsFavorite);

  React.useEffect(() => {
    setIsFavorite(initialIsFavorite);
  }, [initialIsFavorite]);

  const toggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault(); // prevent link navigation
    const userId = localStorage.getItem('user_id');
    const token = localStorage.getItem('auth_token');
    
    if (!userId || !token) {
      toast.error('Favorilere eklemek için önce giriş yapmalısınız.');
      return;
    }
    
    try {
      const res = await fetch(`http://localhost:8000/api/users/${userId}/favorites/${recipe.id}`, { 
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (res.status === 401) {
        localStorage.clear();
        window.location.href = '/login';
        throw new Error("Oturum süreniz doldu. Lütfen tekrar giriş yapın.");
      }
      
      if (res.ok) {
        const data = await res.json();
        const added = data.status === 'added';
        setIsFavorite(added);
        if (added) {
          toast.success("Tarif favorilere eklendi");
        } else {
          toast.success("Tarif favorilerden çıkarıldı");
        }
      } else {
        toast.error("İşlem başarısız oldu.");
      }
    } catch(err: any) {
      console.error("Failed to toggle favorite:", err);
      toast.error(err.message || "Bir hata oluştu");
    }
  };
  return (
    <Link to={`/recipe/${recipe.id}`} className="group flex flex-col">
      <div className="relative aspect-[4/5] rounded-xl overflow-hidden mb-4 bg-surface-container">
        <img 
          src={recipe.image} 
          alt={recipe.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          referrerPolicy="no-referrer"
        />
        {recipe.match_percentage && (
          <div className="absolute top-4 left-4 bg-primary text-on-primary text-xs font-bold px-3 py-1.5 rounded-full shadow-lg shadow-primary/30 backdrop-blur-md bg-opacity-95">
            %{recipe.match_percentage} Uyumlu
          </div>
        )}
        <button 
          onClick={toggleFavorite}
          className={`absolute top-4 right-4 bg-surface/90 backdrop-blur-sm p-2 rounded-full shadow-sm hover:scale-110 transition-all ${isFavorite ? 'text-primary' : 'text-on-surface-variant'}`}
        >
          <Heart className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
        </button>
      </div>
      
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold uppercase tracking-widest text-secondary">
            {recipe.tags && recipe.tags.length > 0 ? `${recipe.tags[0]} • ` : ''}{recipe.prepTime}
          </span>
          <div className="flex items-center text-primary">
            <Star className="w-3 h-3 fill-current" />
            <span className="text-xs font-bold ml-1">{recipe.rating}</span>
          </div>
        </div>
        <h3 className="font-headline text-xl group-hover:text-primary transition-colors italic">
          {recipe.title}
        </h3>
        <p className="text-on-surface-variant text-sm font-body line-clamp-2 leading-relaxed">
          {recipe.description}
        </p>
      </div>
    </Link>
  );
}
