import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, ArrowLeft, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

export function Signup() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('http://localhost:8000/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Kayıt başarısız');

      localStorage.setItem('user_id', data.user_id);
      localStorage.setItem('user_name', data.name);
      localStorage.setItem('auth_token', data.token);

      toast.success('Kayıt başarılı! Yönlendiriliyorsunuz...');
      setTimeout(() => {
        navigate('/onboarding');
        window.location.reload();
      }, 1000);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="min-h-screen flex items-center justify-center p-4 md:p-8 lg:p-12">
      <div className="w-full max-w-6xl flex flex-col md:flex-row bg-surface-container-lowest rounded-xl overflow-hidden ambient-shadow">
        {/* Visual Section */}
        <div className="hidden md:block md:w-1/2 relative min-h-[600px]">
          <img 
            src="https://images.unsplash.com/photo-1506368249639-73a05d6f6488?q=80&w=1974&auto=format&fit=crop"
            alt="Kitchen Atmosphere"
            className="absolute inset-0 w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-on-surface/10 backdrop-blur-[2px]"></div>
          <div className="absolute bottom-12 left-12 right-12 text-white">
            <span className="font-body text-sm uppercase tracking-widest text-primary-container mb-2 block">Mutfak Mirası</span>
            <h2 className="font-headline text-5xl italic leading-tight">Mutfak sırlarımızı sizinle paylaşıyoruz.</h2>
          </div>
        </div>

        {/* Form Section */}
        <div className="w-full md:w-1/2 p-8 md:p-16 flex flex-col justify-center bg-surface-container-low">
          <div className="max-w-md mx-auto w-full">
            <div className="mb-10 text-center md:text-left">
              <span className="text-primary font-headline text-3xl italic font-bold">Eat What You Like</span>
            </div>

            <div className="mb-8">
              <h1 className="font-headline text-4xl text-on-surface leading-tight mb-3 italic">Kendi Mutfak Hikayenizi Yazmaya Başlayın</h1>
              <p className="text-on-surface-variant font-body">Size özel tarifler, teknikler ve gastronomi dünyasından en taze haberler için aramıza katılın.</p>
            </div>

            <form className="space-y-5" onSubmit={handleSignup}>
              <div className="space-y-1.5">
                <label className="block font-body text-sm font-bold text-on-surface-variant" htmlFor="name">Tam İsim</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-on-surface-variant" />
                  <input 
                    id="name"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Adınız ve soyadınız"
                    className="w-full pl-12 pr-4 py-3 bg-surface-container-lowest border border-outline-variant/20 rounded-lg focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block font-body text-sm font-bold text-on-surface-variant" htmlFor="email">E-posta Adresi</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-on-surface-variant" />
                  <input 
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="orn@email.com"
                    className="w-full pl-12 pr-4 py-3 bg-surface-container-lowest border border-outline-variant/20 rounded-lg focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block font-body text-sm font-bold text-on-surface-variant" htmlFor="password">Şifre</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-on-surface-variant" />
                  <input 
                    id="password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-12 pr-4 py-3 bg-surface-container-lowest border border-outline-variant/20 rounded-lg focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all"
                  />
                </div>
              </div>

              <div className="flex items-start gap-3 pt-2">
                <input type="checkbox" id="terms" className="mt-1 w-4 h-4 text-primary border-outline-variant rounded focus:ring-primary" />
                <label htmlFor="terms" className="text-xs text-on-surface-variant leading-relaxed">
                  <Link to="#" className="text-primary hover:underline">Kullanım Koşulları</Link>'nı ve <Link to="#" className="text-primary hover:underline">Gizlilik Politikası</Link>'nı okudum ve kabul ediyorum.
                </label>
              </div>

              <button disabled={loading} className="w-full flex justify-center items-center gap-2 bg-sunset-gradient text-on-primary py-4 rounded-xl font-bold text-lg ambient-shadow hover:scale-[1.02] transition-transform duration-200 mt-4 disabled:opacity-50">
                {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : "Mutfak Yolculuğuna Başla"}
              </button>
            </form>

            <div className="mt-10 text-center">
              <p className="text-on-surface-variant font-body">
                Zaten hesabınız var mı? <Link to="/login" className="text-primary font-bold hover:underline ml-1">Giriş yapın</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
