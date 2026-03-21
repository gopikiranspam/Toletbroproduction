import React, { useState } from 'react';
import { Search, MapPin, QrCode, Navigation } from 'lucide-react';
import { motion } from 'motion/react';

export const Hero: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'RENT' | 'BUY'>('RENT');

  return (
    <section className="relative flex min-h-[60vh] flex-col items-center justify-start px-6 pt-0 pb-20 overflow-hidden">
      {/* Background subtle glow */}
      <div className="absolute top-1/2 left-1/2 -z-10 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand/10 blur-[120px]"></div>

      <div className="relative z-10 mx-auto w-full max-w-5xl text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="mb-[20px] text-[50px] font-bold tracking-tight leading-[72px] text-[var(--text-primary)] pt-0 pl-0 pb-[2px]">
            Find Your Perfect <br />
            <span className="text-brand">Living Space</span>
          </h1>
          <p className="mx-auto mb-12 max-w-2xl text-lg md:text-xl text-[var(--text-secondary)] opacity-80">
            Premium property listings with instant QR discovery and direct owner connections.
          </p>
        </motion.div>

        {/* Search Container - Based on Image UI */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="mx-auto w-full max-w-4xl overflow-hidden rounded-[20px] border border-[var(--border)] bg-[var(--card-bg)]/50 p-4 backdrop-blur-3xl shadow-2xl"
        >
          <div className="p-4 md:p-8">
            {/* Top Row: Tabs and Near Me */}
            <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex w-fit rounded-2xl bg-[var(--bg)] p-1.5 border border-[var(--border)]">
                <button
                  onClick={() => setActiveTab('RENT')}
                  className={`rounded-xl px-8 py-2.5 text-sm font-bold transition-all ${
                    activeTab === 'RENT' 
                      ? 'bg-brand text-black shadow-lg shadow-brand/20' 
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  Rent
                </button>
                <button
                  onClick={() => setActiveTab('BUY')}
                  className={`rounded-xl px-8 py-2.5 text-sm font-bold transition-all ${
                    activeTab === 'BUY' 
                      ? 'bg-brand text-black shadow-lg shadow-brand/20' 
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  Buy
                </button>
              </div>

              <button className="flex items-center justify-center gap-2 rounded-2xl border border-[var(--border)] bg-[var(--bg)] px-6 py-3 text-xs font-bold uppercase tracking-widest text-[var(--text-primary)] transition-all hover:border-brand hover:text-brand">
                <Navigation size={14} />
                <span>Near Me</span>
              </button>
            </div>

            {/* Bottom Row: Input, QR, Search */}
            <div className="flex flex-col gap-4 md:flex-row">
              <div className="relative flex-1">
                <Search className="absolute top-1/2 left-5 -translate-y-1/2 text-[var(--text-secondary)]/50" size={20} />
                <input 
                  type="text" 
                  placeholder="Location, locality or Owner QR..." 
                  className="h-16 w-full rounded-2xl border border-[var(--border)] bg-[var(--bg)] pl-14 pr-6 text-sm font-medium outline-none transition-all focus:border-brand focus:ring-1 focus:ring-brand/20 text-[var(--text-primary)]"
                />
              </div>
              
              <div className="flex gap-4">
                <button className="flex h-16 w-16 items-center justify-center rounded-2xl border border-[var(--border)] bg-[var(--bg)] text-[var(--text-secondary)] transition-all hover:border-brand hover:text-brand">
                  <QrCode size={24} />
                </button>
                <button className="flex h-16 flex-1 items-center justify-center rounded-2xl bg-brand px-10 font-black uppercase tracking-[0.2em] text-black transition-all hover:scale-[1.02] active:scale-[0.98] shadow-xl shadow-brand/20 md:flex-none md:px-12">
                  Search
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
