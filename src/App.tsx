/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { FounderSection } from './components/FounderSection';
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
          <div className="mb-12 flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            <div>
              <h2 className="mb-4 text-3xl font-bold tracking-tight md:text-5xl text-[var(--text-primary)]">
                Find Your <span className="text-brand">Perfect</span> To-Let
              </h2>
              <p className="text-[var(--text-secondary)]">Verified properties, direct from owners. No brokers, no hidden costs.</p>
            </div>
            <button 
              onClick={() => navigate('/search/any')}
              className="flex items-center gap-2 text-sm font-bold text-brand transition-all hover:gap-3"
            >
              View All Listings <ArrowRight size={18} />
            </button>
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
        <div className="mx-auto max-w-7xl overflow-hidden rounded-[3rem] bg-brand px-12 py-20 text-black shadow-2xl shadow-brand/20">
          <div className="grid grid-cols-1 items-center gap-12 md:grid-cols-2">
            <div>
              <h2 className="mb-6 text-4xl font-bold tracking-tight md:text-6xl leading-tight">
                Own a property? <br />
                Get your <span className="italic">Smart Board.</span>
              </h2>
              <p className="mb-10 text-lg font-medium opacity-80 leading-relaxed">
                Join thousands of owners who are saving on brokerage fees. List your property and get a digital-ready Smart Tolet Board today.
              </p>
              <div className="flex flex-wrap gap-4">
                <button 
                  onClick={() => navigate('/list-property')}
                  className="rounded-2xl bg-black px-10 py-5 font-bold text-white transition-all hover:scale-105 shadow-xl"
                >
                  List Your Property
                </button>
                <button 
                  onClick={() => navigate('/dashboard/qr')}
                  className="rounded-2xl border-2 border-black/10 px-10 py-5 font-bold transition-all hover:scale-105"
                >
                  Manage My Board
                </button>
              </div>
            </div>
            <div className="relative hidden md:block">
              <div className="absolute -inset-4 rounded-[3rem] border-2 border-black/10 rotate-3"></div>
              <img 
                src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&q=80&w=1000" 
                alt="Modern Property"
                referrerPolicy="no-referrer"
                className="relative rounded-[2.5rem] shadow-2xl grayscale hover:grayscale-0 transition-all duration-700"
              />
            </div>
          </div>
        </div>
      </section>
      <FounderSection />
    </main>
  );
};

const AppContent = () => {
  const { user, authModal, openAuth, closeAuth } = useAuth();

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
        {authModal.isOpen && (
          <AuthModal 
            isOpen={authModal.isOpen} 
            onClose={closeAuth} 
            mode={authModal.mode}
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
