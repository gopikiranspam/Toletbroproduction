/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { SearchSection } from './components/SearchSection';
import { PropertyCard } from './components/PropertyCard';
import { FilterBar } from './components/FilterBar';
import { Footer } from './components/Footer';
import { AuthModal } from './components/AuthModal';
import { MobileTabs } from './components/MobileTabs';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight, Loader2, MapPin, Sparkles, Compass, ChevronRight } from 'lucide-react';
import { Property } from './types';
import { api } from './services/api';
import { mapsService } from './services/mapsService';

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
import { Dashboard } from './pages/Dashboard';
import { FavoritesPage } from './pages/FavoritesPage';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';

const HomePage = () => {
  const navigate = useNavigate();
  const [properties, setProperties] = useState<Property[]>([]);
  const [nearbyProperties, setNearbyProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [nearbyLoading, setNearbyLoading] = useState(false);
  const [viewAllNearby, setViewAllNearby] = useState(false);

  const { user } = useAuth();

  useEffect(() => {
    if (user?.role === 'OWNER') {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const data = await api.getProperties();
        setProperties(data);
        
        // Try to get nearby properties on load
        try {
          const pos = await mapsService.getCurrentLocation();
          const nearby = await api.getNearbyProperties(pos.coords.latitude, pos.coords.longitude, 50);
          setNearbyProperties(nearby);
        } catch (err) {
          console.log("Initial nearby search skipped or failed:", err);
        }
      } catch (err) {
        console.error("Failed to load properties:", err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const handleNearbySearch = async () => {
    setNearbyLoading(true);
    try {
      const pos = await mapsService.getCurrentLocation();
      const nearby = await api.getNearbyProperties(pos.coords.latitude, pos.coords.longitude, 50);
      setNearbyProperties(nearby);
      if (nearby.length > 0) {
        // Scroll to nearby section
        const element = document.getElementById('nearby-section');
        element?.scrollIntoView({ behavior: 'smooth' });
      } else {
        alert("No properties found within 50km of your location.");
      }
    } catch (err) {
      console.error("Nearby search failed:", err);
      alert("Could not get your location. Please ensure GPS is enabled.");
    } finally {
      setNearbyLoading(false);
    }
  };

  const suggestedProperties = useMemo(() => {
    return properties.filter(p => p.isFeatured).slice(0, 6);
  }, [properties]);

  const recommendedProperties = useMemo(() => {
    // Properties in other locations (not Hyderabad if nearby is Hyderabad)
    // For now just random ones not in nearby
    const nearbyIds = new Set(nearbyProperties.map(p => p.id));
    return properties.filter(p => !nearbyIds.has(p.id)).slice(0, 6);
  }, [properties, nearbyProperties]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--bg)]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 size={48} className="animate-spin text-brand" />
          <p className="text-sm font-bold uppercase tracking-widest text-[var(--text-secondary)]">Loading Masterpieces...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="pb-20 md:pb-0">
      <Hero />
      <SearchSection onNearbySearch={handleNearbySearch} isNearbyLoading={nearbyLoading} />

      <div className="mx-auto max-w-7xl px-6 py-20 space-y-24">
        {/* Nearby Properties Section */}
        {nearbyProperties.length > 0 && (
          <section id="nearby-section" className="space-y-8">
            <div className="flex items-end justify-between">
              <div>
                <div className="mb-2 flex items-center gap-2 text-brand">
                  <MapPin size={18} />
                  <span className="text-xs font-bold uppercase tracking-widest">Local Discovery</span>
                </div>
                <h2 className="text-2xl font-bold tracking-tight md:text-4xl text-[var(--text-primary)]">
                  Properties <span className="text-brand">Nearby</span> You
                </h2>
                <p className="mt-2 text-sm text-[var(--text-secondary)]">Exclusive listings within 50km of your current location.</p>
              </div>
              <button 
                onClick={() => setViewAllNearby(!viewAllNearby)}
                className="flex items-center gap-2 rounded-xl bg-brand/10 px-4 py-2 text-xs font-bold text-brand transition-all hover:bg-brand/20"
              >
                {viewAllNearby ? 'Show Less' : 'View All'}
                <ChevronRight size={16} className={viewAllNearby ? 'rotate-90' : ''} />
              </button>
            </div>

            {viewAllNearby ? (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                <AnimatePresence mode="popLayout">
                  {nearbyProperties.map((property) => (
                    <PropertyCard key={property.id} property={property} />
                  ))}
                </AnimatePresence>
              </div>
            ) : (
              <div className="no-scrollbar -mx-6 flex gap-6 overflow-x-auto px-6 pb-4 md:mx-0 md:px-0">
                {nearbyProperties.map((property) => (
                  <div key={property.id} className="w-[280px] flex-shrink-0 md:w-[320px]">
                    <PropertyCard property={property} />
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* Suggested Properties Section */}
        <section className="space-y-8">
          <div className="flex items-end justify-between">
            <div>
              <div className="mb-2 flex items-center gap-2 text-brand">
                <Sparkles size={18} />
                <span className="text-xs font-bold uppercase tracking-widest">Curated for You</span>
              </div>
              <h2 className="text-2xl font-bold tracking-tight md:text-4xl text-[var(--text-primary)]">
                Suggested <span className="text-brand">Masterpieces</span>
              </h2>
              <p className="mt-2 text-sm text-[var(--text-secondary)]">Hand-picked luxury properties matching your sophisticated taste.</p>
            </div>
            <button className="hidden md:flex items-center gap-2 text-xs font-bold text-brand hover:underline">
              View All <ArrowRight size={14} />
            </button>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {suggestedProperties.map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>
        </section>

        {/* Recommended Properties Section */}
        <section className="space-y-8">
          <div className="flex items-end justify-between">
            <div>
              <div className="mb-2 flex items-center gap-2 text-brand">
                <Compass size={18} />
                <span className="text-xs font-bold uppercase tracking-widest">Global Reach</span>
              </div>
              <h2 className="text-2xl font-bold tracking-tight md:text-4xl text-[var(--text-primary)]">
                Recommended <span className="text-brand">Locations</span>
              </h2>
              <p className="mt-2 text-sm text-[var(--text-secondary)]">Explore premium properties in other prestigious areas.</p>
            </div>
          </div>

          <div className="no-scrollbar -mx-6 flex gap-6 overflow-x-auto px-6 pb-4 md:mx-0 md:px-0">
            {recommendedProperties.map((property) => (
              <div key={property.id} className="w-[280px] flex-shrink-0 md:w-[320px]">
                <PropertyCard property={property} />
              </div>
            ))}
          </div>
        </section>

        {/* Call to Action */}
        <section className="py-12">
          <div className="relative overflow-hidden rounded-[2.5rem] bg-brand px-8 py-16 text-black md:px-12 md:py-20">
            <div className="relative z-10 grid grid-cols-1 items-center gap-12 md:grid-cols-2">
              <div>
                <h2 className="mb-6 text-3xl font-bold tracking-tight md:text-5xl">
                  Ready to find your <br /> next masterpiece?
                </h2>
                <p className="mb-10 text-base font-medium opacity-70 md:text-lg">
                  Our expert agents are ready to guide you through the exclusive world of luxury real estate.
                </p>
                <div className="flex flex-wrap gap-4">
                  <button className="rounded-2xl bg-black px-8 py-4 text-sm font-bold text-white transition-transform hover:scale-105">
                    Contact an Agent
                  </button>
                  <button 
                    onClick={() => navigate('/list-property')}
                    className="rounded-2xl border-2 border-black/10 px-8 py-4 text-sm font-bold transition-transform hover:scale-105"
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
            {/* Abstract background shapes */}
            <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-black/5 blur-3xl"></div>
            <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-white/10 blur-3xl"></div>
          </div>
        </section>
      </div>
    </main>
  );
};

const AppContent = () => {
  const { user, authModal, openAuth, closeAuth } = useAuth();

  useEffect(() => {
    // Silently request GPS permission on mount
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        () => console.log("GPS permission granted"),
        () => console.log("GPS permission denied"),
        { enableHighAccuracy: true, timeout: 5000 }
      );
    }
  }, []);

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
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/dashboard/qr" element={<OwnerQRDashboard />} />
        <Route path="/favorites" element={<FavoritesPage />} />
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
