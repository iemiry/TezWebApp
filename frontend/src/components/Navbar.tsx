import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Search, User, Menu, LogOut } from 'lucide-react';
import { cn } from '../lib/utils';

export function Navbar() {
  const location = useLocation();
  const isAuthPage = location.pathname === '/login' || location.pathname === '/signup';
  const [userName, setUserName] = useState<string | null>(null);

  useEffect(() => {
    setUserName(localStorage.getItem('user_name'));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user_id');
    localStorage.removeItem('user_name');
    window.location.reload();
  };

  if (isAuthPage) return null;

  return (
    <header className="fixed top-0 w-full z-50 glass-nav">
      <div className="flex justify-between items-center px-8 py-4 max-w-screen-2xl mx-auto">
        <Link to="/" className="text-2xl font-headline italic text-primary font-bold">
          Eat What You Like
        </Link>
        
        <nav className="hidden md:flex items-center space-x-8 font-body text-sm font-medium">
          <Link 
            to="/" 
            className={cn(
              "transition-colors hover:text-primary",
              location.pathname === '/' ? "text-primary border-b-2 border-primary pb-1" : "text-on-surface-variant"
            )}
          >
            Explore
          </Link>
          <Link to="/categories" className="text-on-surface-variant hover:text-primary transition-colors">
            Categories
          </Link>
          <Link to="/favorites" className="text-on-surface-variant hover:text-primary transition-colors">
            My Favorites
          </Link>
        </nav>

        <div className="flex items-center space-x-4">
          <div className="hidden sm:flex items-center bg-surface-container px-4 py-2 rounded-full border border-outline-variant/20 focus-within:border-outline-variant/100 transition-all">
            <Search className="w-4 h-4 text-on-surface-variant" />
            <input 
              type="text" 
              placeholder="Find a recipe..." 
              className="bg-transparent border-none focus:ring-0 text-sm w-40 ml-2"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && e.currentTarget.value) {
                  window.location.href = `/?q=${e.currentTarget.value}`;
                }
              }}
            />
          </div>
          {userName ? (
            <div className="flex items-center gap-4">
              <Link to="/profile" className="flex items-center gap-2 hover:bg-surface-container rounded-full pr-3 transition-all">
                <div className="p-2 bg-primary/10 rounded-full text-primary">
                  <User className="w-5 h-5" />
                </div>
                <span className="font-bold text-sm hidden sm:block">{userName}</span>
              </Link>
              <button onClick={handleLogout} className="p-2 hover:bg-red-50 text-red-500 rounded-full transition-all" title="Çıkış Yap">
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <Link to="/login" className="text-sm font-bold text-on-surface-variant hover:text-primary transition-colors hidden sm:block">Giriş Yap</Link>
              <Link to="/signup" className="text-sm font-bold px-5 py-2 bg-primary text-on-primary rounded-full shadow-md hover:bg-primary-container transition-colors">Kayıt Ol</Link>
            </div>
          )}
          <button className="md:hidden p-2 hover:bg-surface-container rounded-full transition-all">
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </div>
    </header>
  );
}
