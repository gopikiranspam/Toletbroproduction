import React from 'react';
import { Search, MapPin, Calendar, DollarSign } from 'lucide-react';
import { motion } from 'motion/react';

export const Hero: React.FC = () => {
  return (
    <section className="relative flex min-h-[80vh] items-center justify-center overflow-hidden px-6 pt-20 pb-32">
      {/* Background with gradient overlay */}
      <div className="absolute inset-0 z-0">
        <img 
          src="https://images.unsplash.com/photo-1600607687940-4e524cb35a3a?auto=format&fit=crop&q=80&w=2000" 
          alt="Luxury Home"
          referrerPolicy="no-referrer"
          className="h-full w-full object-cover opacity-40 dark:opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[var(--bg)] via-[var(--bg)]/80 to-[var(--bg)]"></div>
      </div>

      <div className="relative z-10 mx-auto max-w-4xl text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <span className="mb-4 inline-block rounded-full border border-brand/30 bg-brand/10 px-4 py-1.5 text-sm font-semibold text-brand">
            Premium Real Estate
          </span>
          <h1 className="mb-6 text-5xl font-bold tracking-tight md:text-7xl text-[var(--text-primary)]">
            Find Your Dream <br />
            <span className="text-brand">Luxury Home</span>
          </h1>
          <p className="mx-auto mb-12 max-w-2xl text-lg text-[var(--text-secondary)]">
            Discover an exclusive collection of high-end properties in the most prestigious locations around the world.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="mx-auto max-w-3xl rounded-3xl border border-[var(--border)] bg-[var(--card-bg)] p-2 backdrop-blur-2xl"
        >
          <div className="grid grid-cols-1 divide-y divide-[var(--border)] md:grid-cols-4 md:divide-y-0 md:divide-x">
            <div className="flex flex-col items-start px-6 py-4">
              <span className="mb-1 flex items-center gap-2 text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">
                <MapPin size={12} /> Location
              </span>
              <input 
                type="text" 
                placeholder="Where to?" 
                className="w-full bg-transparent text-sm font-medium outline-none placeholder:text-[var(--text-secondary)]/30 text-[var(--text-primary)]"
              />
            </div>
            <div className="flex flex-col items-start px-6 py-4">
              <span className="mb-1 flex items-center gap-2 text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">
                <Calendar size={12} /> Property Type
              </span>
              <select className="w-full bg-transparent text-sm font-medium outline-none appearance-none cursor-pointer text-[var(--text-primary)]">
                <option className="bg-[var(--bg)]">All Types</option>
                <option className="bg-[var(--bg)]">Villa</option>
                <option className="bg-[var(--bg)]">Penthouse</option>
                <option className="bg-[var(--bg)]">Apartment</option>
              </select>
            </div>
            <div className="flex flex-col items-start px-6 py-4">
              <span className="mb-1 flex items-center gap-2 text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">
                <DollarSign size={12} /> Price Range
              </span>
              <select className="w-full bg-transparent text-sm font-medium outline-none appearance-none cursor-pointer text-[var(--text-primary)]">
                <option className="bg-[var(--bg)]">Any Price</option>
                <option className="bg-[var(--bg)]">$1M - $2M</option>
                <option className="bg-[var(--bg)]">$2M - $5M</option>
                <option className="bg-[var(--bg)]">$5M+</option>
              </select>
            </div>
            <div className="flex items-center justify-center p-2">
              <button className="flex h-full w-full items-center justify-center gap-2 rounded-2xl bg-brand px-6 py-3 font-bold text-black transition-transform hover:scale-[1.02] active:scale-[0.98]">
                <Search size={20} />
                <span>Search</span>
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
