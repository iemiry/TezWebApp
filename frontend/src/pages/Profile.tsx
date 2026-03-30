import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Edit, PlusCircle, Grid, List, Heart, Utensils, Calendar, Wheat, Flame } from 'lucide-react';
import { MOCK_USER } from '../constants';
import { RecipeCard } from '../components/RecipeCard';
import { Recipe } from '../types';

export function Profile({ defaultActiveTab = 'recommended' }: { defaultActiveTab?: 'recommended' | 'saved' | 'collections' }) {
  const user = MOCK_USER;
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [activeTab, setActiveTab] = useState<'recommended' | 'saved' | 'collections'>(defaultActiveTab);
  
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
    const userId = localStorage.getItem('user_id') || '1';
    
    if (activeTab === 'recommended') {
      fetch(`http://localhost:8000/api/recommendations/${userId}`)
        .then(res => res.json())
        .then(data => setRecipes(data))
        .catch(err => console.error(err));
    } else if (activeTab === 'saved') {
      // First get IDs, then query bulk recipes
      fetch(`http://localhost:8000/api/users/${userId}/favorites`)
        .then(res => res.json())
        .then(ids => {
          if (!ids || ids.length === 0) return setRecipes([]);
          return fetch(`http://localhost:8000/api/recipes/bulk`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
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
          <div className="w-40 h-40 rounded-full overflow-hidden border-4 border-surface-container">
            <img 
              src={user.avatar} 
              alt={user.name}
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
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
            <div>
              <span className="block text-2xl font-headline text-primary font-bold">{user.stats.collections}</span>
              <span className="text-xs font-body uppercase tracking-tighter text-on-surface-variant">Collections</span>
            </div>
          </div>
        </div>

        <div className="hidden lg:block">
          <button className="bg-sunset-gradient text-on-primary px-8 py-4 rounded-xl font-bold shadow-xl hover:opacity-90 transition-all flex items-center gap-2">
            <PlusCircle className="w-5 h-5" />
            Add New Recipe
          </button>
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
          <button 
            onClick={() => setActiveTab('collections')}
            className={`pb-4 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${activeTab === 'collections' ? 'border-primary text-primary font-bold' : 'border-transparent text-on-surface-variant hover:text-on-surface'}`}>
            My Collections
          </button>
        </div>
      </section>

      {/* Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Sidebar */}
        <aside className="lg:col-span-3 space-y-10">
          <div>
            <h3 className="font-headline text-xl mb-6 italic">Collections</h3>
            <div className="space-y-3">
              {[
                { name: 'Italian Night', icon: Utensils, count: 24 },
                { name: 'Meal Prep Sunday', icon: Calendar, count: 12, active: true },
                { name: 'Sourdough Journey', icon: Wheat, count: 8 },
                { name: 'Summer Grill', icon: Flame, count: 19 }
              ].map((col) => (
                <div 
                  key={col.name}
                  className={`group flex items-center justify-between p-4 rounded-xl transition-colors cursor-pointer ${
                    col.active ? 'bg-surface-container border-l-4 border-primary' : 'bg-surface-container-low hover:bg-surface-container'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <col.icon className="w-5 h-5 text-secondary" />
                    <span className="font-body text-sm font-medium">{col.name}</span>
                  </div>
                  <span className="text-xs text-on-surface-variant group-hover:text-primary transition-colors">{col.count}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-secondary-container/30 p-6 rounded-xl border border-secondary/10">
            <Wheat className="w-6 h-6 text-secondary mb-2" />
            <h4 className="font-headline text-lg text-secondary mb-2 italic">Sustainable Chef</h4>
            <p className="text-xs font-body text-on-surface-variant leading-relaxed">
              You've saved 42kg of CO2 this month by choosing plant-based seasonal recipes.
            </p>
          </div>
        </aside>

        {/* Recipe Grid */}
        <div className="lg:col-span-9">
          <div className="flex justify-between items-end mb-8">
            <div>
              <h2 className="font-headline text-3xl italic">
                {activeTab === 'recommended' ? 'Curated For You' : activeTab === 'saved' ? 'Your Saved Vault' : 'Collections'}
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
              <RecipeCard key={recipe.id} recipe={recipe} />
            ))}
            
            {/* Add New Card */}
            <div className="flex flex-col items-center justify-center aspect-[4/5] rounded-xl border-2 border-dashed border-outline-variant/30 hover:border-primary/40 hover:bg-surface-container-low transition-all cursor-pointer group">
              <div className="bg-primary/10 p-4 rounded-full mb-4 group-hover:scale-110 transition-transform">
                <PlusCircle className="w-8 h-8 text-primary" />
              </div>
              <span className="font-body font-bold text-on-surface-variant group-hover:text-primary">Add New Recipe</span>
              <span className="text-[10px] text-on-surface-variant mt-1">Import from URL or create from scratch</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
