/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { PropertyCard } from './components/PropertyCard';
import { FilterBar } from './components/FilterBar';
import { Footer } from './components/Footer';
import { AuthModal } from './components/AuthModal';
import { MobileTabs } from './components/MobileTabs';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight, Loader2 } from 'lucide-react';
import { Property } from './types';
import { api } from './services/api';

// Pages
import { QRSetupPage } from './pages/QRSetupPage';
import { OwnerListingsPage } from './pages/OwnerListingsPage';
import { PropertyDetailsPage } from './pages/PropertyDetailsPage';
import { SearchPage } from './pages/SearchPage';
import { OwnerQRDashboard } from './pages/OwnerQRDashboard';
import { AdminQRPanel } from './pages/AdminQRPanel';
import { ProfilePage } from './pages/ProfilePage';
import { ScannerPage } from './pages/ScannerPage';
import { QRResolverPage } from './pages/QRResolverPage';
import { ListProperty } from './pages/ListProperty';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';

const HomePage = () => {
  const navigate = useNavigate();
  const [selectedType, setSelectedType] = useState('All');
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getProperties().then(data => {
      setProperties(data);
      setLoading(false);
    });
  }, []);

  const filteredProperties = useMemo(() => {
    if (selectedType === 'All') return properties;
    return properties.filter(p => p.type === selectedType);
  }, [selectedType, properties]);

  return (
    <main className="pb-20 md:pb-0">
      <Hero />

      {/* Featured Section */}
      <section className="py-24 px-6">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12 flex items-end justify-between">
            <div>
              <h2 className="mb-4 text-3xl font-bold tracking-tight md:text-4xl text-[var(--text-primary)]">
                Explore Our <span className="text-brand">Curated</span> Collection
              </h2>
              <p className="text-[var(--text-secondary)]">Hand-picked luxury properties for the most discerning tastes.</p>
            </div>
            <div className="hidden md:block">
              <button className="flex items-center gap-2 text-sm font-bold text-brand transition-all hover:gap-3">
                View All Properties <ArrowRight size={18} />
              </button>
            </div>
          </div>

          <FilterBar selectedType={selectedType} onSelectType={setSelectedType} />

          {loading ? (
            <div className="flex justify-center py-20">
              <Loader2 size={48} className="animate-spin text-brand" />
            </div>
          ) : (
            <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              <AnimatePresence mode="popLayout">
                {filteredProperties.map((property) => (
                  <PropertyCard key={property.id} property={property} />
                ))}
              </AnimatePresence>
            </div>
          )}

          {!loading && filteredProperties.length === 0 && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-20 text-center"
            >
              <p className="text-xl text-[var(--text-secondary)]">No properties found matching your criteria.</p>
              <button 
                onClick={() => setSelectedType('All')}
                className="mt-4 text-brand underline underline-offset-4"
              >
                Clear filters
              </button>
            </motion.div>
          )}
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-24 px-6">
        <div className="mx-auto max-w-7xl overflow-hidden rounded-[2.5rem] bg-brand px-12 py-20 text-black">
          <div className="grid grid-cols-1 items-center gap-12 md:grid-cols-2">
            <div>
              <h2 className="mb-6 text-4xl font-bold tracking-tight md:text-5xl">
                Ready to find your <br /> next masterpiece?
              </h2>
              <p className="mb-10 text-lg font-medium opacity-70">
                Our expert agents are ready to guide you through the exclusive world of luxury real estate.
              </p>
              <div className="flex flex-wrap gap-4">
                <button className="rounded-2xl bg-black px-8 py-4 font-bold text-white transition-transform hover:scale-105">
                  Contact an Agent
                </button>
                <button 
                  onClick={() => navigate('/list-property')}
                  className="rounded-2xl border-2 border-black/10 px-8 py-4 font-bold transition-transform hover:scale-105"
                >
                  List Your Property
                </button>
              </div>
            </div>
            <div className="relative hidden md:block">
              <img 
                src="https://images.unsplash.com/photo-1600585154340-be6199f7d009?auto=format&fit=crop&q=80&w=1000" 
                alt="Luxury Interior"
                referrerPolicy="no-referrer"
                className="rounded-3xl shadow-2xl"
              />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

const AppContent = () => {
  const { user } = useAuth();
  const [authConfig, setAuthConfig] = useState<{ isOpen: boolean; mode: 'USER' | 'ADMIN' }>({
    isOpen: false,
    mode: 'USER'
  });

  const openAuth = (mode: 'USER' | 'ADMIN' = 'USER') => {
    setAuthConfig({ isOpen: true, mode });
  };

  const closeAuth = () => {
    setAuthConfig(prev => ({ ...prev, isOpen: false }));
  };

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text-primary)] selection:bg-brand selection:text-black transition-colors duration-300">
      <Navbar onOpenAuth={() => openAuth('USER')} />
      
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/scan/:qrId" element={<QRResolverPage />} />
        <Route path="/link-qr/:qrId" element={<QRSetupPage />} />
        <Route path="/owner-properties/:ownerId" element={<OwnerListingsPage />} />
        <Route path="/property/:propertySlugId" element={<PropertyDetailsPage />} />
        <Route path="/search/:city" element={<SearchPage />} />
        <Route path="/search/:city/:area" element={<SearchPage />} />
        <Route path="/dashboard/qr" element={<OwnerQRDashboard />} />
        <Route path="/admin/qr" element={<AdminQRPanel onOpenAuth={() => openAuth('ADMIN')} />} />
        <Route path="/scan" element={<ScannerPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/list-property" element={<ListProperty onOpenAuth={() => openAuth('USER')} />} />
      </Routes>

      <Footer />
      
      <MobileTabs user={user} onOpenAuth={() => openAuth('USER')} />
      
      <AnimatePresence>
        {authConfig.isOpen && (
          <AuthModal 
            isOpen={authConfig.isOpen} 
            onClose={closeAuth} 
            mode={authConfig.mode}
          />
        )}
      </AnimatePresence>

      {/* Global hidden reCAPTCHA container */}
      <div id="recaptcha-container" className="recaptcha-container"></div>
    </div>
  );
};

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <AppContent />
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}
