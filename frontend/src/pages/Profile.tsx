import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Edit, PlusCircle, Grid, List, Heart, Utensils, Calendar, Wheat, Flame, User } from 'lucide-react';
import { MOCK_USER } from '../constants';
import { RecipeCard } from '../components/RecipeCard';
import { Recipe } from '../types';

export function Profile({ defaultActiveTab = 'recommended' }: { defaultActiveTab?: 'recommended' | 'saved' }) {
  const user = MOCK_USER;
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<'recommended' | 'saved'>(defaultActiveTab);
  
  useEffect(() => {
    setActiveTab(defaultActiveTab);
  }, [defaultActiveTab]);
  
  const [userName, setUserName] = useState(localStorage.getItem('user_name') || user.name);
  const [userBio, setUserBio] = useState(localStorage.getItem('user_bio') || user.bio);
  
  const handleEditProfile = () => {
    const newName = prompt("Yeni isminizi girin:", userName);
    const newBio = prompt("Hakkınızda kısa bir bilgi girin:", userBio);
    if (newName) {
       setUserName(newName);
       localStorage.setItem('user_name', newName);
    }
    if (newBio) {
       setUserBio(newBio);
       localStorage.setItem('user_bio', newBio);
    }
  };

  useEffect(() => {
    const userId = localStorage.getItem('user_id');
    if (userId) {
      fetch(`http://localhost:8000/api/users/${userId}/favorites`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setFavoriteIds(data.map(String));
      })
      .catch(err => console.error(err));
    }
  }, []);

  useEffect(() => {
    const userId = localStorage.getItem('user_id') || '1';
    
    if (activeTab === 'recommended') {
      fetch(`http://localhost:8000/api/recommendations/${userId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      })
        .then(res => {
          if (res.status === 401) {
             localStorage.clear();
             window.location.href = '/login';
             throw new Error('Oturum süreniz doldu.');
          }
          return res.json();
        })
        .then(data => setRecipes(data))
        .catch(err => console.error(err));
    } else if (activeTab === 'saved') {
      // First get IDs, then query bulk recipes
      fetch(`http://localhost:8000/api/users/${userId}/favorites`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      })
        .then(res => {
          if (res.status === 401) {
             localStorage.clear();
             window.location.href = '/login';
             throw new Error('Oturum süreniz doldu.');
          }
          return res.json();
        })
        .then(ids => {
          if (!ids || ids.length === 0 || ids.detail) return setRecipes([]);
          return fetch(`http://localhost:8000/api/recipes/bulk`, {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
            },
            body: JSON.stringify({ recipe_ids: ids })
          }).then(r => r.json()).then(data => setRecipes(data));
        })
        .catch(err => console.error("Error fetching favorites", err));
    } else {
      setRecipes([]); // empty state for others
    }
  }, [activeTab]);

  return (
    <div className="pb-20">
      {/* Profile Header */}
      <section className="flex flex-col md:flex-row items-center md:items-start gap-10 mb-16 pt-8">
        <div className="relative group">
          <div className="w-40 h-40 rounded-full overflow-hidden border-4 border-surface-container flex items-center justify-center bg-surface-container-high text-on-surface-variant">
            <User className="w-20 h-20" strokeWidth={1.5} />
          </div>
          <button onClick={handleEditProfile} className="absolute bottom-1 right-1 bg-primary text-on-primary p-2 rounded-full shadow-lg hover:scale-105 transition-transform">
            <Edit className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 text-center md:text-left">
          <div className="mb-4">
            <span className="font-body text-xs uppercase tracking-widest text-secondary font-bold">Chef de Cuisine</span>
            <h1 className="text-5xl font-headline font-medium mt-1 mb-2 italic">{userName}</h1>
            <p className="text-on-surface-variant font-body max-w-xl text-lg italic leading-relaxed">
              {userBio}
            </p>
          </div>
          
          <div className="flex flex-wrap justify-center md:justify-start gap-8 mt-6">
            <div>
              <span className="block text-2xl font-headline text-primary font-bold">{user.stats.recipes}</span>
              <span className="text-xs font-body uppercase tracking-tighter text-on-surface-variant">Recipes</span>
            </div>
            <div>
              <span className="block text-2xl font-headline text-primary font-bold">{user.stats.followers}</span>
              <span className="text-xs font-body uppercase tracking-tighter text-on-surface-variant">Followers</span>
            </div>
          </div>
        </div>

      </section>

      {/* Tabs */}
      <section className="mb-12 border-b border-outline-variant/10">
        <div className="flex gap-12 overflow-x-auto pb-0">
          <button 
            onClick={() => setActiveTab('recommended')}
            className={`pb-4 border-b-2 font-bold text-sm whitespace-nowrap transition-colors ${activeTab === 'recommended' ? 'border-primary text-primary' : 'border-transparent text-on-surface-variant hover:text-on-surface'}`}>
            For You (Recommendations)
          </button>
          <button 
            onClick={() => setActiveTab('saved')}
            className={`pb-4 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${activeTab === 'saved' ? 'border-primary text-primary font-bold' : 'border-transparent text-on-surface-variant hover:text-on-surface'}`}>
            Saved Recipes
          </button>
        </div>
      </section>

      {/* Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Recipe Grid */}
        <div className="lg:col-span-12">
          <div className="flex justify-between items-end mb-8">
            <div>
              <h2 className="font-headline text-3xl italic">
                {activeTab === 'recommended' ? 'Curated For You' : 'Your Saved Vault'}
              </h2>
              <p className="text-on-surface-variant font-body text-sm mt-1">
                {activeTab === 'recommended' ? 'Machine learning powered recommendations' : 'Recipes you have marked with a heart'}
              </p>
            </div>
            <div className="flex gap-2">
              <button className="p-2 rounded-lg bg-surface-container hover:bg-surface-container-high transition-colors">
                <Grid className="w-5 h-5" />
              </button>
              <button className="p-2 rounded-lg text-on-surface-variant hover:bg-surface-container transition-colors">
                <List className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
            {recipes.map(recipe => (
              <RecipeCard key={recipe.id} recipe={recipe} initialIsFavorite={activeTab === 'saved' || favoriteIds.includes(String(recipe.id))} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
