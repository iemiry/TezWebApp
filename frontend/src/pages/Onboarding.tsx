import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, ChevronRight, ChefHat } from 'lucide-react';
import toast from 'react-hot-toast';

const TAGS = [
  { id: 'chicken', label: 'Chicken Dishes' },
  { id: 'vegetarian', label: 'Vegetarian' },
  { id: 'desserts', label: 'Desserts' },
  { id: 'quick', label: 'Quick & Easy' },
  { id: 'spicy', label: 'Spicy' },
  { id: 'beef', label: 'Beef' },
  { id: 'healthy', label: 'Healthy' },
  { id: 'pasta', label: 'Pasta' },
  { id: 'seafood', label: 'Seafood' },
  { id: 'breakfast', label: 'Breakfast' },
  { id: 'salad', label: 'Salads' },
  { id: 'soup', label: 'Soups' }
];

export function Onboarding() {
  const [selected, setSelected] = useState<string[]>([]);
  const navigate = useNavigate();

  const toggleTag = (id: string) => {
    setSelected(prev => 
      prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]
    );
  };

  const handleSave = () => {
    const userId = localStorage.getItem('user_id');
    const token = localStorage.getItem('auth_token');
    
    if (!userId || !token) {
      navigate('/login');
      return;
    }
    
    if (selected.length === 0) {
      toast.error("Please select at least one preference");
      return;
    }
    
    fetch(`http://localhost:8000/api/users/${userId}/preferences`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ preferences: selected })
    })
    .then(res => {
       if (res.status === 401) {
         localStorage.clear();
         navigate('/login');
         return;
       }
       if(res.ok) {
         toast.success("Perfect! Curating your personalized feed...", { duration: 3000 });
         navigate('/');
       } else {
         toast.error("An error occurred.");
       }
    })
    .catch(err => {
      console.error(err);
      toast.error("Please check your internet connection.");
    });
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Decorative Blur Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/20 blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-secondary/20 blur-[120px] pointer-events-none"></div>

      <div className="max-w-4xl w-full bg-surface-container-low/50 backdrop-blur-xl border border-white/20 p-10 md:p-16 rounded-3xl shadow-2xl relative z-10 animate-fade-in-up">
        
        <div className="text-center mb-12">
          <div className="w-20 h-20 bg-primary-container text-primary rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
            <ChefHat className="w-10 h-10" />
          </div>
          <h1 className="text-4xl md:text-5xl font-headline font-bold text-on-surface mb-4 italic">Welcome to Eat What You Like</h1>
          <p className="text-lg text-on-surface-variant font-body mb-2">We'd love to get to know your taste better!</p>
          <p className="text-sm font-bold uppercase tracking-widest text-primary">Choose Your Favorite Categories Below</p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-4 mb-14">
          {TAGS.map(tag => {
            const isSelected = selected.includes(tag.id);
            return (
              <button
                key={tag.id}
                onClick={() => toggleTag(tag.id)}
                className={`flex items-center gap-2 px-6 py-3 rounded-full font-bold text-sm transition-all duration-300 border-2 ${
                  isSelected 
                    ? 'bg-primary border-primary text-on-primary shadow-lg shadow-primary/30 -translate-y-1' 
                    : 'bg-surface border-outline-variant/30 text-on-surface hover:border-primary/50 hover:shadow-md'
                }`}
              >
                {isSelected && <CheckCircle2 className="w-4 h-4" />}
                {tag.label}
              </button>
            )
          })}
        </div>

        <div className="flex justify-center">
          <button 
            onClick={handleSave}
            className="flex items-center gap-3 bg-secondary text-on-secondary px-10 py-5 rounded-full font-bold text-lg shadow-xl shadow-secondary/20 hover:bg-secondary-container hover:text-on-secondary-container transition-all hover:-translate-y-1 active:scale-95 group"
          >
            Save My Flavor Profile
            <ChevronRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
          </button>
        </div>
      </div>
    </div>
  );
}
