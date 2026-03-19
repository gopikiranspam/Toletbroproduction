import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, CheckCircle, UserCircle, Home, LogIn, Loader2, Mail, Lock, User as UserIcon, ArrowLeft } from 'lucide-react';
import { UserRole } from '../types';
import { useAuth } from '../context/AuthContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { user, loginWithGoogle, loginWithEmail, signUpWithEmail, updateUserRole, checkUserExists } = useAuth();
  const [step, setStep] = useState<'LOGIN' | 'EMAIL_AUTH' | 'ROLE'>('LOGIN');
  const [authMode, setAuthMode] = useState<'LOGIN' | 'SIGNUP'>('LOGIN');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Email Auth Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  // If user logs in and doesn't have a role or we want them to confirm role
  useEffect(() => {
    if (user && (step === 'LOGIN' || step === 'EMAIL_AUTH')) {
      if (user.role === 'ADMIN') {
        onClose();
      } else {
        setStep('ROLE');
      }
    }
  }, [user, step, onClose]);

  const handleGoogleLogin = async () => {
    setIsLoggingIn(true);
    setError(null);
    try {
      await loginWithGoogle();
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.message || 'An unexpected error occurred during login.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setError(null);

    try {
      if (authMode === 'LOGIN') {
        await loginWithEmail(email, password);
      } else {
        // Signup
        if (!name.trim()) {
          setError('Name is required for signup');
          setIsLoggingIn(false);
          return;
        }
        const exists = await checkUserExists(email);
        if (exists) {
          setError('An account with this email already exists. Please login instead.');
          setIsLoggingIn(false);
          return;
        }
        await signUpWithEmail(email, password, name);
      }
    } catch (err: any) {
      console.error('Email auth error:', err);
      if (err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        setError('Incorrect email or password. Please try again.');
      } else if (err.code === 'auth/user-not-found') {
        setError('No account found with this email. Please sign up first.');
      } else if (err.code === 'auth/email-already-in-use') {
        setError('This email is already in use.');
      } else if (err.code === 'auth/weak-password') {
        setError('Password should be at least 6 characters.');
      } else {
        setError(err.message || 'Authentication failed.');
      }
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleSelectRole = async (selectedRole: UserRole) => {
    try {
      await updateUserRole(selectedRole);
      onClose();
    } catch (error) {
      console.error('Role selection error:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-6">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
      />
      
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="relative w-full max-w-md overflow-hidden rounded-[2.5rem] border border-[var(--border)] bg-[var(--card-bg)] p-8 shadow-2xl"
      >
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 text-[var(--text-secondary)] transition-colors hover:text-[var(--text-primary)]"
        >
          <X size={24} />
        </button>

        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-brand/10 text-brand">
            <LogIn size={32} />
          </div>
          <h2 className="text-2xl font-bold text-[var(--text-primary)]">
            {step === 'ROLE' ? 'One last step' : 'Welcome to ToLetBro'}
          </h2>
          <p className="text-sm text-[var(--text-secondary)]">
            {step === 'ROLE' ? 'Help us personalize your experience' : 'Experience smart real estate'}
          </p>
        </div>

        <AnimatePresence mode="wait">
          {step === 'LOGIN' && (
            <motion.div
              key="login"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <button 
                onClick={handleGoogleLogin}
                disabled={isLoggingIn}
                className="flex w-full items-center justify-center gap-3 rounded-xl bg-white py-4 font-bold text-black transition-transform hover:scale-[1.02] disabled:opacity-50"
              >
                {isLoggingIn ? (
                  <Loader2 size={20} className="animate-spin" />
                ) : (
                  <>
                    <img src="https://www.google.com/favicon.ico" alt="Google" className="h-5 w-5" />
                    Continue with Google
                  </>
                )}
              </button>

              <div className="relative flex items-center justify-center">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-[var(--border)]"></div>
                </div>
                <span className="relative bg-[var(--card-bg)] px-4 text-xs font-bold uppercase tracking-widest text-[var(--text-secondary)]">
                  or
                </span>
              </div>

              <button 
                onClick={() => setStep('EMAIL_AUTH')}
                className="flex w-full items-center justify-center gap-3 rounded-xl border border-[var(--border)] bg-white/5 py-4 font-bold text-[var(--text-primary)] transition-transform hover:scale-[1.02]"
              >
                <Mail size={20} />
                Continue with Email
              </button>

              {error && (
                <div className="rounded-xl bg-red-500/10 p-4 text-center text-xs font-medium text-red-500">
                  {error}
                </div>
              )}
              <p className="text-center text-xs text-[var(--text-secondary)]">
                By continuing, you agree to our Terms of Service and Privacy Policy.
              </p>
            </motion.div>
          )}

          {step === 'EMAIL_AUTH' && (
            <motion.div
              key="email-auth"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <button 
                onClick={() => setStep('LOGIN')}
                className="flex items-center gap-2 text-xs font-bold text-brand transition-colors hover:text-brand/80"
              >
                <ArrowLeft size={16} />
                Back to options
              </button>

              <form onSubmit={handleEmailAuth} className="space-y-4">
                {authMode === 'SIGNUP' && (
                  <div className="relative">
                    <UserIcon className="absolute top-4 left-4 text-[var(--text-secondary)]" size={20} />
                    <input 
                      type="text"
                      placeholder="Full Name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg)] py-4 pl-12 pr-4 text-[var(--text-primary)] focus:border-brand focus:outline-none"
                    />
                  </div>
                )}
                <div className="relative">
                  <Mail className="absolute top-4 left-4 text-[var(--text-secondary)]" size={20} />
                  <input 
                    type="email"
                    placeholder="Email Address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg)] py-4 pl-12 pr-4 text-[var(--text-primary)] focus:border-brand focus:outline-none"
                  />
                </div>
                <div className="relative">
                  <Lock className="absolute top-4 left-4 text-[var(--text-secondary)]" size={20} />
                  <input 
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg)] py-4 pl-12 pr-4 text-[var(--text-primary)] focus:border-brand focus:outline-none"
                  />
                </div>

                <button 
                  type="submit"
                  disabled={isLoggingIn}
                  className="flex w-full items-center justify-center gap-3 rounded-xl bg-brand py-4 font-bold text-black transition-transform hover:scale-[1.02] disabled:opacity-50"
                >
                  {isLoggingIn ? (
                    <Loader2 size={20} className="animate-spin" />
                  ) : (
                    authMode === 'LOGIN' ? 'Login' : 'Create Account'
                  )}
                </button>
              </form>

              <div className="text-center">
                <button 
                  onClick={() => setAuthMode(authMode === 'LOGIN' ? 'SIGNUP' : 'LOGIN')}
                  className="text-sm text-[var(--text-secondary)]"
                >
                  {authMode === 'LOGIN' ? (
                    <>Don't have an account? <span className="font-bold text-brand">Sign up</span></>
                  ) : (
                    <>Already have an account? <span className="font-bold text-brand">Login</span></>
                  )}
                </button>
              </div>

              {error && (
                <div className="rounded-xl bg-red-500/10 p-4 text-center text-xs font-medium text-red-500">
                  {error}
                </div>
              )}
            </motion.div>
          )}

          {step === 'ROLE' && (
            <motion.div
              key="role"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              <p className="mb-6 text-center text-sm text-[var(--text-secondary)]">Tell us how you'll use ToLetBro</p>
              
              <button 
                onClick={() => handleSelectRole('OWNER')}
                className="flex w-full items-center gap-4 rounded-2xl border border-[var(--border)] bg-[var(--bg)] p-4 text-left transition-all hover:border-brand/50 hover:bg-brand/5"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand/10 text-brand">
                  <Home size={24} />
                </div>
                <div>
                  <p className="font-bold text-[var(--text-primary)]">Property Owner</p>
                  <p className="text-xs text-[var(--text-secondary)]">I want to list and manage properties</p>
                </div>
              </button>

              <button 
                onClick={() => handleSelectRole('FINDER')}
                className="flex w-full items-center gap-4 rounded-2xl border border-[var(--border)] bg-[var(--bg)] p-4 text-left transition-all hover:border-brand/50 hover:bg-brand/5"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand/10 text-brand">
                  <UserCircle size={24} />
                </div>
                <div>
                  <p className="font-bold text-[var(--text-primary)]">House Finder</p>
                  <p className="text-xs text-[var(--text-secondary)]">I'm looking for my next dream home</p>
                </div>
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};
