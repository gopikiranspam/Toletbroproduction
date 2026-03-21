import React from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { PrivacyControls } from '../components/PrivacyControls';
import { useAuth } from '../context/AuthContext';

export const PrivacyPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthReady } = useAuth();

  if (!isAuthReady) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand border-t-transparent"></div>
      </div>
    );
  }

  if (!user || user.role !== 'OWNER') {
    return (
      <div className="flex h-[80vh] flex-col items-center justify-center text-center px-6">
        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-brand/10 text-brand">
          <ShieldCheck size={40} />
        </div>
        <h2 className="text-2xl font-bold text-[var(--text-primary)]">Access Restricted</h2>
        <p className="mt-2 text-[var(--text-secondary)]">Privacy controls are only available for property owners.</p>
        <button 
          onClick={() => navigate('/')}
          className="mt-8 rounded-2xl bg-brand px-8 py-4 font-bold text-black transition-transform hover:scale-105"
        >
          Go to Home
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-6 py-12 pb-32">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="mb-8 flex items-center gap-4">
          <button 
            onClick={() => navigate(-1)}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--card-bg)] border border-[var(--border)] text-[var(--text-primary)]"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h2 className="text-2xl font-bold text-[var(--text-primary)]">Privacy Settings</h2>
            <p className="text-xs text-[var(--text-secondary)]">Manage how and when tenants can reach you.</p>
          </div>
        </div>
        
        <PrivacyControls />
      </motion.div>

      <div className="mt-12 text-center">
        <p className="text-[10px] uppercase tracking-widest text-[var(--text-secondary)] opacity-50">
          Your privacy is our priority
        </p>
      </div>
    </div>
  );
};
