import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, ArrowLeft, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

export function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const res = await fetch('http://localhost:8000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      
      if (!res.ok) throw new Error('Giriş başarısız');
      
      const data = await res.json();
      localStorage.setItem('user_id', data.user_id);
      localStorage.setItem('user_name', data.name);
      localStorage.setItem('auth_token', data.token);
      if (data.bio) {
        localStorage.setItem('user_bio', data.bio);
      }
      toast.success('Giriş başarılı! Yönlendiriliyorsunuz...');
      
      // Navigate to profile or home
      setTimeout(() => {
        navigate('/');
        window.location.reload(); // Quick state reset
      }, 1000);
    } catch (err: any) {
      toast.error(err.message);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden py-12">
      {/* Background Image with Blur */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <img 
          src="https://images.unsplash.com/photo-1556910103-1c02745aae4d?q=80&w=2070&auto=format&fit=crop"
          alt="Kitchen"
          className="w-full h-full object-cover scale-110 blur-md opacity-40"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-tr from-surface via-transparent to-surface-container-low/30"></div>
      </div>

      {/* Login Container */}
      <main className="relative z-10 w-full max-w-xl px-6">
        <div className="bg-surface/85 backdrop-blur-xl rounded-xl shadow-2xl p-8 md:p-12 flex flex-col gap-8 border border-outline-variant/20">
          {/* Header Section */}
          <div className="text-center space-y-3">
            <span className="text-secondary font-bold text-xs uppercase tracking-widest block font-body">Hoş Geldiniz</span>
            <h1 className="text-4xl md:text-5xl font-headline italic text-on-surface leading-tight">Lezzet Yolculuğuna Devam Edin</h1>
            <p className="text-on-surface-variant font-body text-sm max-w-xs mx-auto">Heirloom Kitchen dünyasına giriş yaparak favori tariflerinize ve mutfak sırlarınıza ulaşın.</p>
          </div>

          {/* Login Form */}
          <form className="space-y-6" onSubmit={handleLogin}>
            {error && <div className="text-red-500 text-sm font-bold bg-red-100 p-3 rounded-lg">{error}</div>}
            <div className="space-y-2">
              <label className="block text-sm font-bold text-on-surface font-body" htmlFor="email">E-posta Adresi</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-on-surface-variant group-focus-within:text-primary transition-colors" />
                <input 
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ornek@mutfak.com"
                  className="w-full pl-12 pr-4 py-4 rounded-xl bg-surface-container-lowest border border-outline-variant/30 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="block text-sm font-bold text-on-surface font-body" htmlFor="password">Şifre</label>
                <Link to="#" className="text-xs font-bold text-primary hover:text-primary-container transition-colors">Şifremi Unuttum</Link>
              </div>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-on-surface-variant group-focus-within:text-primary transition-colors" />
                <input 
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-12 pr-4 py-4 rounded-xl bg-surface-container-lowest border border-outline-variant/30 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                />
              </div>
            </div>

            <button disabled={loading} className="w-full flex justify-center items-center gap-2 bg-sunset-gradient text-on-primary font-bold py-4 rounded-xl shadow-lg hover:shadow-xl hover:scale-[1.01] active:scale-95 transition-all duration-200">
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Giriş Yap"}
            </button>
          </form>

          {/* Divider */}
          <div className="relative flex items-center gap-4">
            <div className="flex-grow h-[1px] bg-outline-variant/40"></div>
            <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">veya</span>
            <div className="flex-grow h-[1px] bg-outline-variant/40"></div>
          </div>

          {/* Social Login */}
          <div className="grid grid-cols-2 gap-4">
            <button className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-surface-container-high hover:bg-surface-container-highest transition-colors font-body text-sm font-bold text-on-surface">
              Google
            </button>
            <button className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-surface-container-high hover:bg-surface-container-highest transition-colors font-body text-sm font-bold text-on-surface">
              Apple
            </button>
          </div>

          <p className="text-center text-sm text-on-surface-variant font-body">
            Henüz bir hesabınız yok mu? <Link to="/signup" className="text-primary font-bold hover:underline">Hemen Kaydolun</Link>
          </p>
        </div>

        <div className="mt-8 text-center">
          <Link to="/" className="inline-flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors group">
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span className="font-headline italic text-lg">Eat What You Like ana sayfasına dön</span>
          </Link>
        </div>
      </main>
    </div>
  );
}
