import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, 
  Trash2, 
  Edit3, 
  Save, 
  X, 
  Image as ImageIcon, 
  Link as LinkIcon, 
  Type, 
  AlignLeft, 
  CheckCircle2, 
  Eye, 
  EyeOff,
  Loader2,
  Layout
} from 'lucide-react';
import { api } from '../services/api';
import { Slide } from '../types';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export const AdminSlidesPanel: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthReady } = useAuth();
  const [slides, setSlides] = useState<Slide[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingSlide, setEditingSlide] = useState<Partial<Slide> | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const isAdmin = user?.role === 'ADMIN' || user?.email === 'gopikiranspam@gmail.com';

  useEffect(() => {
    if (isAuthReady && !isAdmin) {
      navigate('/');
    }
    if (isAdmin) {
      loadSlides();
    }
  }, [isAdmin, isAuthReady, navigate]);

  const loadSlides = async () => {
    setLoading(true);
    try {
      const data = await api.getSlides(false);
      setSlides(data);
    } catch (error) {
      console.error("Failed to load slides:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNew = () => {
    setEditingSlide({
      title: '',
      subtitle: '',
      description: '',
      imageUrl: '',
      buttonText: 'Learn More',
      link: '',
      actionLink: '',
      offerText: '',
      isActive: true,
      order: slides.length + 1
    });
  };

  const handleSave = async () => {
    if (!editingSlide) return;
    setIsSaving(true);
    try {
      if ('id' in editingSlide && editingSlide.id) {
        await api.updateSlide(editingSlide.id, editingSlide);
      } else {
        await api.createSlide(editingSlide as Omit<Slide, 'id' | 'createdAt'>);
      }
      setEditingSlide(null);
      loadSlides();
    } catch (error) {
      console.error("Failed to save slide:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this slide?')) {
      await api.deleteSlide(id);
      loadSlides();
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--bg)]">
        <Loader2 size={48} className="animate-spin text-brand" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg)] pb-24 pt-24 px-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-12 flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight md:text-5xl text-[var(--text-primary)]">Manage <span className="text-brand">Slideshow</span></h1>
            <p className="mt-2 text-[var(--text-secondary)]">Create and edit marketing slides for the owner dashboard.</p>
            <div className="mt-4 flex gap-4">
              <button 
                onClick={() => navigate('/admin/qr')}
                className="flex items-center gap-2 rounded-xl bg-[var(--card-bg)] border border-[var(--border)] px-4 py-2 text-xs font-bold text-[var(--text-primary)] transition-all hover:border-brand hover:text-brand"
              >
                <Layout size={16} />
                QR Generator
              </button>
            </div>
          </div>
          
          <button 
            onClick={handleCreateNew}
            className="flex items-center justify-center gap-2 rounded-2xl bg-brand px-8 py-4 font-bold text-black shadow-lg shadow-brand/20 transition-transform hover:scale-105"
          >
            <Plus size={20} />
            Add New Slide
          </button>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {slides.map((slide) => (
            <motion.div 
              key={slide.id}
              layout
              className="group relative overflow-hidden rounded-[2rem] border border-[var(--border)] bg-[var(--card-bg)] p-6 shadow-sm transition-all hover:shadow-xl"
            >
              <div className="relative mb-4 h-40 w-full overflow-hidden rounded-2xl">
                <img 
                  src={slide.imageUrl} 
                  alt={slide.title}
                  className="h-full w-full object-cover transition-transform group-hover:scale-110"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute top-3 right-3 flex gap-2">
                  <span className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-widest ${slide.isActive ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                    {slide.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-brand">
                  <Layout size={12} />
                  <span className="text-[10px] font-bold uppercase tracking-widest">{slide.subtitle}</span>
                </div>
                <h3 className="text-lg font-bold text-[var(--text-primary)]">{slide.title}</h3>
                <p className="text-xs text-[var(--text-secondary)] line-clamp-2">{slide.description}</p>
                
                {slide.offerText && (
                  <div className="mt-2">
                    <span className="rounded-full bg-brand/10 px-2 py-0.5 text-[10px] font-bold text-brand border border-brand/20">
                      {slide.offerText}
                    </span>
                  </div>
                )}
              </div>

              <div className="mt-6 flex items-center justify-between border-t border-[var(--border)] pt-4">
                <div className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-widest">Order: {slide.order}</div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => setEditingSlide(slide)}
                    className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--bg)] text-[var(--text-primary)] transition-colors hover:bg-brand hover:text-black"
                  >
                    <Edit3 size={16} />
                  </button>
                  <button 
                    onClick={() => handleDelete(slide.id)}
                    className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-500/10 text-red-500 transition-colors hover:bg-red-500 hover:text-white"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {slides.length === 0 && (
          <div className="flex flex-col items-center justify-center py-32 text-center">
            <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-[var(--card-bg)] text-[var(--text-secondary)] border border-[var(--border)]">
              <Layout size={40} />
            </div>
            <p className="text-xl text-[var(--text-secondary)]">No slides created yet.</p>
          </div>
        )}
      </div>

      {/* Edit/Create Modal */}
      <AnimatePresence>
        {editingSlide && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center px-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setEditingSlide(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-[2.5rem] border border-[var(--border)] bg-[var(--card-bg)] p-8 shadow-2xl"
            >
              <div className="mb-8 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-[var(--text-primary)]">
                  {editingSlide.id ? 'Edit Slide' : 'Create New Slide'}
                </h2>
                <button onClick={() => setEditingSlide(null)} className="text-[var(--text-secondary)] hover:text-brand">
                  <X size={24} />
                </button>
              </div>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[var(--text-secondary)]">
                      <Type size={14} /> Title
                    </label>
                    <input 
                      type="text" 
                      value={editingSlide.title}
                      onChange={(e) => setEditingSlide({...editingSlide, title: e.target.value})}
                      className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg)] p-4 text-sm focus:border-brand focus:outline-none"
                      placeholder="e.g., Order Smart Tolet Board"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[var(--text-secondary)]">
                      <Layout size={14} /> Subtitle
                    </label>
                    <input 
                      type="text" 
                      value={editingSlide.subtitle}
                      onChange={(e) => setEditingSlide({...editingSlide, subtitle: e.target.value})}
                      className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg)] p-4 text-sm focus:border-brand focus:outline-none"
                      placeholder="e.g., Limited Time Offer"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[var(--text-secondary)]">
                      <AlignLeft size={14} /> Description
                    </label>
                    <textarea 
                      value={editingSlide.description}
                      onChange={(e) => setEditingSlide({...editingSlide, description: e.target.value})}
                      className="h-32 w-full rounded-xl border border-[var(--border)] bg-[var(--bg)] p-4 text-sm focus:border-brand focus:outline-none"
                      placeholder="Marketing matter goes here..."
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[var(--text-secondary)]">
                      <ImageIcon size={14} /> Image URL
                    </label>
                    <input 
                      type="text" 
                      value={editingSlide.imageUrl}
                      onChange={(e) => setEditingSlide({...editingSlide, imageUrl: e.target.value})}
                      className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg)] p-4 text-sm focus:border-brand focus:outline-none"
                      placeholder="https://..."
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[var(--text-secondary)]">
                      <LinkIcon size={14} /> Detail Page Link
                    </label>
                    <input 
                      type="text" 
                      value={editingSlide.link}
                      onChange={(e) => setEditingSlide({...editingSlide, link: e.target.value})}
                      className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg)] p-4 text-sm focus:border-brand focus:outline-none"
                      placeholder="/offer/plan-id"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[var(--text-secondary)]">
                      <LinkIcon size={14} /> Action/Checkout Link
                    </label>
                    <input 
                      type="text" 
                      value={editingSlide.actionLink}
                      onChange={(e) => setEditingSlide({...editingSlide, actionLink: e.target.value})}
                      className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg)] p-4 text-sm focus:border-brand focus:outline-none"
                      placeholder="/checkout/plan-id"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold uppercase tracking-widest text-[var(--text-secondary)]">Button Text</label>
                      <input 
                        type="text" 
                        value={editingSlide.buttonText}
                        onChange={(e) => setEditingSlide({...editingSlide, buttonText: e.target.value})}
                        className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg)] p-4 text-sm focus:border-brand focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold uppercase tracking-widest text-[var(--text-secondary)]">Offer Text</label>
                      <input 
                        type="text" 
                        value={editingSlide.offerText}
                        onChange={(e) => setEditingSlide({...editingSlide, offerText: e.target.value})}
                        className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg)] p-4 text-sm focus:border-brand focus:outline-none"
                        placeholder="e.g., 20% OFF"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold uppercase tracking-widest text-[var(--text-secondary)]">Order</label>
                      <input 
                        type="number" 
                        value={editingSlide.order}
                        onChange={(e) => setEditingSlide({...editingSlide, order: parseInt(e.target.value)})}
                        className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg)] p-4 text-sm focus:border-brand focus:outline-none"
                      />
                    </div>
                    <div className="flex items-end pb-2">
                      <button 
                        onClick={() => setEditingSlide({...editingSlide, isActive: !editingSlide.isActive})}
                        className={`flex w-full items-center justify-center gap-2 rounded-xl py-4 text-xs font-bold transition-all ${editingSlide.isActive ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}
                      >
                        {editingSlide.isActive ? <Eye size={16} /> : <EyeOff size={16} />}
                        {editingSlide.isActive ? 'Active' : 'Hidden'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-10 flex gap-4">
                <button 
                  onClick={() => setEditingSlide(null)}
                  className="flex-1 rounded-2xl border border-[var(--border)] py-4 font-bold text-[var(--text-primary)] transition-colors hover:bg-[var(--bg)]"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleSave}
                  disabled={isSaving}
                  className="flex flex-[2] items-center justify-center gap-2 rounded-2xl bg-brand py-4 font-bold text-black shadow-lg shadow-brand/20 transition-transform hover:scale-[1.02] disabled:opacity-50"
                >
                  {isSaving ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />}
                  Save Slide
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
