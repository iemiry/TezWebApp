/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { Home } from './pages/Home';
import { RecipeDetail } from './pages/RecipeDetail';
import { Profile } from './pages/Profile';
import { Login } from './pages/Login';
import { Signup } from './pages/Signup';
import { Onboarding } from './pages/Onboarding';
import { Categories } from './pages/Categories';
import { cn } from './lib/utils';
import { Toaster } from 'react-hot-toast';

function AppContent() {
  const location = useLocation();
  const isAuthPage = ['/login', '/signup', '/onboarding'].includes(location.pathname);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className={cn(
        "flex-grow w-full mx-auto",
        !isAuthPage ? "pt-24 px-8 max-w-screen-2xl" : ""
      )}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/recipe/:id" element={<RecipeDetail />} />
          <Route path="/categories" element={<Categories />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/favorites" element={<Profile defaultActiveTab="saved" />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/onboarding" element={<Onboarding />} />
        </Routes>
      </main>
      {!isAuthPage && <Footer />}
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <Toaster position="bottom-right" />
      <AppContent />
    </Router>
  );
}
