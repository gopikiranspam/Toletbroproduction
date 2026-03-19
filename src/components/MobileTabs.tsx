import React from 'react';
import { Home, Search, QrCode, Heart, User, Plus } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface MobileTabsProps {
  onOpenAuth: () => void;
}

export const MobileTabs: React.FC<MobileTabsProps> = ({ onOpenAuth }) => {
  const location = useLocation();
  const { user } = useAuth();
  
  const isActive = (path: string) => location.pathname === path;

  const tabs = [
    { icon: Home, label: 'Home', path: '/' },
    { icon: Search, label: 'Search', path: '/search/all' },
    { icon: Plus, label: 'List', path: '/list-property' },
    { 
      icon: QrCode, 
      label: user?.role === 'OWNER' ? 'Board' : 'Scan', 
      path: user?.role === 'OWNER' ? '/dashboard/qr' : '/scan' 
    },
  ];

  return (
    <div className="fixed bottom-0 left-0 z-50 w-full border-t border-[var(--border)] bg-[var(--navbar-bg)] pb-safe-area backdrop-blur-xl md:hidden transition-colors duration-300">
      <div className="flex h-16 items-center justify-around px-2">
        {tabs.map((tab) => (
          <Link
            key={tab.path}
            to={tab.path}
            className={`flex flex-col items-center gap-1 transition-colors ${
              isActive(tab.path) ? 'text-brand' : 'text-[var(--text-secondary)]/40'
            }`}
          >
            <tab.icon size={20} />
            <span className="text-[10px] font-medium">{tab.label}</span>
          </Link>
        ))}
        
        {user ? (
          <Link
            to="/profile"
            className={`flex flex-col items-center gap-1 transition-colors ${
              isActive('/profile') ? 'text-brand' : 'text-[var(--text-secondary)]/40'
            }`}
          >
            <User size={20} />
            <span className="text-[10px] font-medium">Profile</span>
          </Link>
        ) : (
          <button
            onClick={onOpenAuth}
            className="flex flex-col items-center gap-1 text-[var(--text-secondary)]/40 transition-colors"
          >
            <User size={20} />
            <span className="text-[10px] font-medium">Login</span>
          </button>
        )}
      </div>
    </div>
  );
};
