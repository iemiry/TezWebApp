import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Tag, BookOpen } from 'lucide-react';

export function Categories() {
  const [categories, setCategories] = useState<{name: string, count: number}[]>([]);

  useEffect(() => {
    // Generate some static categories since we don't have a backend aggregation for tags yet
    setCategories([
      { name: "Vegetarian", count: 30156 },
      { name: "Quick Meals", count: 37379 },
      { name: "Desserts", count: 34364 },
      { name: "Healthy", count: 38179 },
      { name: "North American", count: 40598 },
      { name: "Breakfast", count: 11519 },
      { name: "Dinner Ideas", count: 59495 },
      { name: "Baking", count: 203 }
    ]);
  }, []);

  return (
    <div className="pb-20">
      <div className="text-center mb-16 pt-8">
        <span className="text-secondary font-bold text-xs uppercase tracking-widest block font-body mb-2">Keşfedin</span>
        <h1 className="text-4xl md:text-6xl font-headline italic text-on-surface">Tüm Kategoriler</h1>
        <p className="text-on-surface-variant font-body mt-4 max-w-md mx-auto">İstediğiniz kategoriye ait binlerce tarifi Eat What You Like'te kolayca bulabilirsiniz.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {categories.map((cat, i) => (
          <Link key={i} to={`/?category=${cat.name}`} className="group relative aspect-[3/2] overflow-hidden rounded-2xl bg-surface-container shadow-sm hover:shadow-xl transition-all block">
             <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10 transition-opacity group-hover:opacity-80"></div>
             <img 
               src={`https://source.unsplash.com/random/600x400/?${cat.name.toLowerCase()}`}
               alt={cat.name}
               className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
               onError={(e) => { e.currentTarget.src = "https://images.unsplash.com/photo-1490818387583-1b5f222fb209?q=80&w=2000&auto=format&fit=crop"; }}
             />
             <div className="absolute bottom-6 left-6 z-20">
               <h3 className="text-white font-headline text-2xl italic font-bold mb-1">{cat.name}</h3>
               <div className="flex items-center text-white/80 text-xs font-body uppercase tracking-wider font-bold">
                 <BookOpen className="w-3 h-3 mr-2" />
                 {cat.count} Tarif
               </div>
             </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
