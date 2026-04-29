import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Tag, BookOpen } from 'lucide-react';

export function Categories() {
  const [categories, setCategories] = useState<{name: string, count: number}[]>([]);

  const CATEGORY_MAP = [
    { name: "Vegetarian", count: 30156, img: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&w=800" },
    { name: "Quick Meals", count: 37379, img: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&w=800" },
    { name: "Desserts", count: 34364, img: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&w=800" },
    { name: "Healthy", count: 38179, img: "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?auto=format&w=800" },
    { name: "North American", count: 40598, img: "https://images.unsplash.com/photo-1600891964092-4316c288032e?auto=format&w=800" },
    { name: "Breakfast", count: 11519, img: "https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?auto=format&w=800" },
    { name: "Dinner Ideas", count: 59495, img: "https://images.unsplash.com/photo-1473093226795-af9932fe5856?auto=format&w=800" },
    { name: "Baking", count: 203, img: "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&w=800" }
  ];

  useEffect(() => {
    setCategories(CATEGORY_MAP as any);
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
               src={(cat as any).img}
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
