import React, { useState } from 'react';
import { Home, User, Plus, Building2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { ThemeToggle } from './ThemeToggle';
import { useAuth } from '../context/AuthContext';

interface NavbarProps {
  onOpenAuth: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenAuth }) => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleListPropertyClick = () => {
    if (!user) {
      onOpenAuth();
    } else {
      navigate('/list-property');
    }
  };

  return (
    <>
      <nav className="sticky top-0 z-50 w-full border-b border-[var(--border)] bg-[var(--navbar-bg)] backdrop-blur-xl transition-colors duration-300">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6">
          <Link to="/" className="flex items-center gap-2 transition-transform hover:scale-105">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand text-black">
              <Home size={24} />
            </div>
            <span className="text-xl font-bold tracking-tight text-[var(--text-primary)]">ToLetBro</span>
          </Link>

          <div className="hidden items-center gap-8 md:flex">
            <Link to="/search/rent" className="text-sm font-medium text-[var(--text-secondary)] transition-colors hover:text-brand">Rent</Link>
            <Link to="/search/buy" className="text-sm font-medium text-[var(--text-secondary)] transition-colors hover:text-brand">Buy</Link>
            {user?.role === 'OWNER' ? (
              <Link to="/dashboard" className="text-sm font-medium text-[var(--text-secondary)] transition-colors hover:text-brand">Dashboard</Link>
            ) : (
              <Link to="/favorites" className="text-sm font-medium text-[var(--text-secondary)] transition-colors hover:text-brand">Favorites</Link>
            )}
            {user?.role === 'OWNER' ? (
              <Link to="/dashboard/qr" className="text-sm font-medium text-[var(--text-secondary)] transition-colors hover:text-brand">Smart Tolet Board</Link>
            ) : (
              <Link to="/scan" className="text-sm font-medium text-[var(--text-secondary)] transition-colors hover:text-brand">Scan Board</Link>
            )}
          </div>

          <div className="flex items-center gap-4">
            {/* Desktop Theme Toggle */}
            <div className="hidden md:block">
              <ThemeToggle />
            </div>

            {/* List My Property Button - Visible to everyone */}
            <button 
              onClick={handleListPropertyClick}
              className="flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-xs font-bold text-black shadow-sm transition-transform hover:scale-105 active:scale-95 border border-[var(--border)]"
            >
              <Plus size={16} className="text-brand" />
              <span className="hidden sm:inline">List Property</span>
              <span className="sm:hidden">List</span>
            </button>

            {user ? (
              <button 
                onClick={() => navigate('/profile')}
                className="hidden items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--card-bg)] px-4 py-2 text-sm font-medium text-[var(--text-primary)] transition-colors hover:bg-brand hover:text-black md:flex"
              >
                <User size={18} />
                <span>Profile</span>
              </button>
            ) : (
              <button 
                onClick={onOpenAuth}
                className="hidden items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--card-bg)] px-4 py-2 text-sm font-medium text-[var(--text-primary)] transition-colors hover:bg-brand hover:text-black md:flex"
              >
                <User size={18} />
                <span>Sign In</span>
              </button>
            )}
            
            {/* Burger menu removed as per request for mobile */}
          </div>
        </div>
      </nav>
    </>
  );
};
