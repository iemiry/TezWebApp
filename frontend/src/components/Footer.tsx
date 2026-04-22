import React from 'react';
import { Link } from 'react-router-dom';

export function Footer() {
  return (
    <footer className="w-full border-t border-outline-variant/10 bg-surface-container-low mt-20">
      <div className="max-w-7xl mx-auto px-8 py-12">
        <div className="flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex flex-col items-center md:items-start gap-2">
            <span className="font-headline font-bold text-primary text-xl italic">Eat What You Like</span>
            <p className="font-body text-sm text-on-surface-variant">
              © 2024 Eat What You Like. Bütün hakları saklıdır.
            </p>
          </div>
          
          <div className="flex gap-8 font-body text-sm text-on-surface-variant">
            <Link to="#" className="hover:text-primary transition-colors">Gizlilik Politikası</Link>
            <Link to="#" className="hover:text-primary transition-colors">Kullanım Koşulları</Link>
            <Link to="#" className="hover:text-primary transition-colors">Destek</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
