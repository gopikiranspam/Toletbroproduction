import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  Eye, 
  Heart, 
  Share2, 
  Phone, 
  MessageSquare, 
  QrCode, 
  Settings, 
  Trash2, 
  CheckCircle2, 
  XCircle, 
  TrendingUp, 
  Edit3,
  AlertTriangle,
  Loader2,
  ChevronRight,
  Plus
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Property, Slide } from '../types';
import { useNavigate } from 'react-router-dom';
import { Slideshow } from '../components/Slideshow';

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [properties, setProperties] = useState<Property[]>([]);
  const [slides, setSlides] = useState<Slide[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; propertyId: string | null }>({
    isOpen: false,
    propertyId: null
  });

  const [qrModal, setQrModal] = useState<{ isOpen: boolean; property: Property | null }>({
    isOpen: false,
    property: null
  });

  useEffect(() => {
    if (user?.id) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const [propsData, slidesData] = await Promise.all([
        api.getPropertiesByOwnerId(user.id, true),
        api.getSlides(true)
      ]);
      setProperties(propsData);
      
      // If no slides exist, create default ones (only for demo/initial setup)
      if (slidesData.length === 0) {
        const defaultSlides: Omit<Slide, 'id' | 'createdAt'>[] = [
          {
            title: "Order Smart Tolet Board",
            subtitle: "Limited Time Offer",
            description: "Get your smart QR board today with exclusive discounts. Professional marketing for your property.",
            imageUrl: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&q=80&w=1000",
            buttonText: "Order Now",
            link: "/offer/smart-board",
            actionLink: "/checkout/smart-board",
            offerText: "20% OFF TODAY",
            isActive: true,
            order: 1
          },
          {
            title: "Promote for just ₹49",
            subtitle: "Boost Visibility",
            description: "Get your property in front of thousands of potential tenants instantly. First promotion at just ₹49.",
            imageUrl: "https://images.unsplash.com/photo-1582408921715-18e7806365c1?auto=format&fit=crop&q=80&w=1000",
            buttonText: "Promote Now",
            link: "/offer/promotion",
            actionLink: "/checkout/promotion",
            offerText: "₹49 ONLY",
            isActive: true,
            order: 2
          },
          {
            title: "Privacy & Unlimited Posts",
            subtitle: "Premium Features",
            description: "Take Smart Tolet Board + Privacy features + Free promotion + Unlimited posts. The ultimate package.",
            imageUrl: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=1000",
            buttonText: "Go Premium",
            link: "/offer/premium",
            actionLink: "/checkout/premium",
            offerText: "BEST VALUE",
            isActive: true,
            order: 3
          }
        ];
        
        // Only admin should really do this, but for demo we'll seed them
        // In a real app, we'd have a seeding script or admin UI
        setSlides(defaultSlides.map((s, i) => ({ ...s, id: `seed-${i}`, createdAt: new Date().toISOString() })));
      } else {
        setSlides(slidesData);
      }
    } catch (error) {
      console.error("Failed to load dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleQrClick = (property: Property) => {
    setQrModal({ isOpen: true, property });
  };

  const handleToggleOccupied = async (property: Property) => {
    const success = await api.updateProperty(property.id, { isOccupied: !property.isOccupied });
    if (success) loadData();
  };

  const handleToggleActive = async (property: Property) => {
    const success = await api.updateProperty(property.id, { isActive: !property.isActive });
    if (success) loadData();
  };

  const handleDeleteClick = (id: string) => {
    setDeleteModal({ isOpen: true, propertyId: id });
  };

  const confirmDelete = async () => {
    if (deleteModal.propertyId) {
      await api.deleteProperty(deleteModal.propertyId);
      setDeleteModal({ isOpen: false, propertyId: null });
      loadData();
    }
  };

  const activeProperties = properties.filter(p => p.isActive && !p.isOccupied && !p.isDeleted);
  const totalStats = activeProperties.reduce((acc, p) => ({
    scans: acc.scans + (p.scans || 0) + (p.internalScans || 0),
    views: acc.views + (p.views || 0),
    favorites: acc.favorites + (p.favoritesCount || 0),
    shares: acc.shares + (p.shares || 0),
    calls: acc.calls + (p.callClicks || 0),
    messages: acc.messages + (p.messageClicks || 0),
  }), { scans: 0, views: 0, favorites: 0, shares: 0, calls: 0, messages: 0 });

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--bg)]">
        <Loader2 size={48} className="animate-spin text-brand" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg)] pb-32 pt-24 px-6">
      <div className="mx-auto max-w-7xl space-y-12">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-[var(--text-primary)] md:text-5xl">
              Owner <span className="text-brand">Dashboard</span>
            </h1>
            <p className="mt-2 text-[var(--text-secondary)]">Manage your properties and track performance insights.</p>
          </div>
          <button 
            onClick={() => navigate('/list-property')}
            className="flex items-center justify-center gap-2 rounded-2xl bg-brand px-6 py-3 text-sm font-bold text-black shadow-lg shadow-brand/20 transition-transform hover:scale-105"
          >
            <Plus size={18} />
            Add New Property
          </button>
        </div>

        {/* Slideshow Section */}
        {slides.length > 0 && (
          <section className="mx-auto max-w-4xl">
            <Slideshow slides={slides} />
          </section>
        )}

          {/* Insights Section */}
          <section className="space-y-6">
            <div className="flex items-center gap-2 text-brand">
              <TrendingUp size={20} />
              <h2 className="text-xs font-bold uppercase tracking-widest">Insights & Analytics</h2>
            </div>
            
            {/* Mobile: Circular Divisions, Desktop: Grid */}
            <div className="md:bg-transparent md:p-0">
              <div className="flex flex-wrap justify-center gap-4 md:grid md:grid-cols-3 lg:grid-cols-6">
                {[
                  { label: 'Scans', value: totalStats.scans, icon: QrCode, color: 'text-blue-500' },
                  { label: 'Views', value: totalStats.views, icon: Eye, color: 'text-emerald-500' },
                  { label: 'Favorites', value: totalStats.favorites, icon: Heart, color: 'text-rose-500' },
                  { label: 'Shares', value: totalStats.shares, icon: Share2, color: 'text-amber-500' },
                  { label: 'Calls', value: totalStats.calls, icon: Phone, color: 'text-indigo-500' },
                  { label: 'Messages', value: totalStats.messages, icon: MessageSquare, color: 'text-purple-500' },
                ].map((stat, i) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.05 }}
                    className="flex h-24 w-24 flex-col items-center justify-center rounded-full border border-[var(--border)] bg-[var(--card-bg)] p-2 shadow-sm md:h-auto md:w-auto md:rounded-3xl md:p-6"
                  >
                    <stat.icon className={`mb-1 md:mb-4 ${stat.color}`} size={16} />
                    <div className="text-sm md:text-2xl font-bold text-[var(--text-primary)]">{stat.value}</div>
                    <div className="text-[7px] md:text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)]">{stat.label}</div>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>

        {/* Property Management Section */}
        <section className="space-y-6">
          <div className="flex items-center gap-2 text-brand">
            <Settings size={20} />
            <h2 className="text-xs font-bold uppercase tracking-widest">Property Management</h2>
          </div>

          <div className="space-y-4">
            {properties.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-[2.5rem] border-2 border-dashed border-[var(--border)] py-20 text-center">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[var(--bg)] text-[var(--text-secondary)]">
                  <Plus size={32} />
                </div>
                <h3 className="text-xl font-bold text-[var(--text-primary)]">No properties listed yet</h3>
                <p className="mt-2 text-[var(--text-secondary)]">Start by listing your first property to see insights.</p>
                <button 
                  onClick={() => navigate('/list-property')}
                  className="mt-8 rounded-2xl bg-brand px-8 py-3 text-sm font-bold text-black"
                >
                  List My Property
                </button>
              </div>
            ) : (
              properties.map((property) => (
                <motion.div
                  key={property.id}
                  layout
                  className="group relative overflow-hidden rounded-3xl border border-[var(--border)] bg-[var(--card-bg)] p-3 transition-all hover:shadow-lg md:p-4"
                >
                  <div className="flex flex-col gap-4 md:flex-row md:items-center">
                    {/* Thumbnail */}
                    <div className="relative h-24 w-full flex-shrink-0 overflow-hidden rounded-2xl md:h-20 md:w-32">
                      <img 
                        src={property.imageUrl || null} 
                        alt={property.title}
                        referrerPolicy="no-referrer"
                        className="h-full w-full object-cover transition-transform group-hover:scale-110"
                      />
                      {property.isOccupied && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-[2px]">
                          <span className="rounded-lg bg-brand px-2 py-0.5 text-[8px] font-bold uppercase tracking-widest text-black">Occupied</span>
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="truncate text-base font-bold text-[var(--text-primary)]">{property.title}</h3>
                        {!property.isActive && (
                          <span className="rounded-full bg-red-500/10 px-2 py-0.5 text-[8px] font-bold uppercase text-red-500">Disabled</span>
                        )}
                      </div>
                      <p className="truncate text-xs text-[var(--text-secondary)]">{property.location}</p>
                      <div className="mt-2 flex items-center gap-4">
                        <div className="flex items-center gap-1 text-[10px] font-bold text-brand">
                          <Eye size={12} />
                          {property.views || 0}
                        </div>
                        <div className="flex items-center gap-1 text-[10px] font-bold text-brand">
                          <QrCode size={12} />
                          {(property.scans || 0) + (property.internalScans || 0)}
                        </div>
                      </div>
                    </div>

                    {/* Quick Actions - Minimal & Accessible */}
                    <div className="flex flex-wrap items-center gap-2 border-t border-[var(--border)] pt-3 md:border-none md:pt-0">
                      <button 
                        onClick={() => navigate(`/property/${property.slug}-${property.id}`)}
                        className="flex h-9 items-center justify-center gap-2 rounded-xl bg-[var(--bg)] px-4 text-[10px] font-bold text-[var(--text-primary)] transition-colors hover:bg-brand hover:text-black"
                      >
                        <ChevronRight size={14} />
                        View
                      </button>
                      <button 
                        onClick={() => handleQrClick(property)}
                        className="flex h-9 items-center justify-center gap-2 rounded-xl bg-[var(--bg)] px-4 text-[10px] font-bold text-[var(--text-primary)] transition-colors hover:bg-brand hover:text-black"
                      >
                        <QrCode size={14} />
                        QR
                      </button>
                      <button 
                        onClick={() => navigate(`/list-property?edit=${property.id}`)}
                        className="flex h-9 items-center justify-center gap-2 rounded-xl bg-[var(--bg)] px-4 text-[10px] font-bold text-[var(--text-primary)] transition-colors hover:bg-brand hover:text-black"
                      >
                        <Edit3 size={14} />
                        Edit
                      </button>
                      <button 
                        onClick={() => handleToggleOccupied(property)}
                        className={`flex h-9 items-center justify-center gap-2 rounded-xl px-4 text-[10px] font-bold transition-all ${
                          property.isOccupied 
                            ? 'bg-brand text-black' 
                            : 'bg-[var(--bg)] text-[var(--text-primary)] hover:bg-brand hover:text-black'
                        }`}
                      >
                        <CheckCircle2 size={14} />
                        {property.isOccupied ? 'Available' : 'Occupied'}
                      </button>
                      <button 
                        onClick={() => handleToggleActive(property)}
                        className={`flex h-9 items-center justify-center gap-2 rounded-xl px-4 text-[10px] font-bold transition-all ${
                          property.isActive 
                            ? 'bg-emerald-500/10 text-emerald-500' 
                            : 'bg-red-500/10 text-red-500'
                        }`}
                      >
                        {property.isActive ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
                        {property.isActive ? 'Active' : 'Hidden'}
                      </button>
                      <button 
                        onClick={() => handleDeleteClick(property.id)}
                        className="flex h-9 items-center justify-center gap-2 rounded-xl bg-red-500/10 px-4 text-[10px] font-bold text-red-500 transition-colors hover:bg-red-500"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </section>
      </div>

      {/* Delete Warning Modal */}
      <AnimatePresence>
        {deleteModal.isOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center px-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDeleteModal({ isOpen: false, propertyId: null })}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-md rounded-[2.5rem] border border-[var(--border)] bg-[var(--card-bg)] p-8 shadow-2xl"
            >
              <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-amber-500/10 text-amber-500">
                <AlertTriangle size={32} />
              </div>
              <h3 className="mb-4 text-2xl font-bold text-[var(--text-primary)]">Wait! Consider this...</h3>
              <p className="mb-8 text-[var(--text-secondary)] leading-relaxed">
                Instead of deleting, you can mark your property as <span className="font-bold text-brand">"Occupied"</span>. 
                <br /><br />
                This way, it won't show up in active search results and no one will call you, but you'll keep all your stats and can easily re-list it later!
              </p>
              <div className="flex flex-col gap-3">
                <button
                  onClick={() => {
                    const prop = properties.find(p => p.id === deleteModal.propertyId);
                    if (prop) handleToggleOccupied(prop);
                    setDeleteModal({ isOpen: false, propertyId: null });
                  }}
                  className="rounded-2xl bg-brand py-4 text-sm font-bold text-black shadow-lg shadow-brand/20 transition-transform hover:scale-[1.02]"
                >
                  Mark as Occupied Instead
                </button>
                <button
                  onClick={confirmDelete}
                  className="rounded-2xl bg-red-500/10 py-4 text-sm font-bold text-red-500 transition-colors hover:bg-red-500/20"
                >
                  Yes, Delete Permanently
                </button>
                <button
                  onClick={() => setDeleteModal({ isOpen: false, propertyId: null })}
                  className="py-2 text-xs font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      {/* QR Code Modal */}
      <AnimatePresence>
        {qrModal.isOpen && qrModal.property && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center px-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setQrModal({ isOpen: false, property: null })}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-md rounded-[2.5rem] border border-[var(--border)] bg-[var(--card-bg)] p-8 shadow-2xl text-center"
            >
              <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-brand/10 text-brand mx-auto">
                <QrCode size={32} />
              </div>
              <h3 className="mb-2 text-2xl font-bold text-[var(--text-primary)]">Property QR Code</h3>
              <p className="mb-6 text-sm text-[var(--text-secondary)]">
                Scan this code to view the property details directly.
              </p>
              
              <div className="mx-auto mb-8 flex h-48 w-48 items-center justify-center rounded-3xl bg-white p-4 shadow-inner">
                <img 
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(`${window.location.origin}/property/${qrModal.property.slug}-${qrModal.property.id}?source=qr`)}`}
                  alt="Property QR Code"
                  className="h-full w-full"
                />
              </div>

              <div className="flex flex-col gap-3">
                <button
                  onClick={() => {
                    const url = `${window.location.origin}/property/${qrModal.property?.slug}-${qrModal.property?.id}?source=qr`;
                    navigator.clipboard.writeText(url);
                    // Could add a toast here
                  }}
                  className="rounded-2xl bg-brand py-4 text-sm font-bold text-black shadow-lg shadow-brand/20 transition-transform hover:scale-[1.02]"
                >
                  Copy QR Link
                </button>
                <button
                  onClick={() => setQrModal({ isOpen: false, property: null })}
                  className="py-2 text-xs font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
