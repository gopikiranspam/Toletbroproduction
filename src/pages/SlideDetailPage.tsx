import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowLeft, CheckCircle2, Sparkles, ShieldCheck, Zap, Star } from 'lucide-react';
import { api } from '../services/api';
import { Slide } from '../types';

export const SlideDetailPage: React.FC = () => {
  const { slideId } = useParams();
  const navigate = useNavigate();
  const [slide, setSlide] = useState<Slide | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSlide = async () => {
      if (!slideId) return;
      setLoading(true);
      try {
        const slides = await api.getSlides(false);
        const found = slides.find(s => s.id === slideId || s.link.includes(slideId));
        if (found) {
          setSlide(found);
        } else {
          // Mock data if not found (for the seeded slides)
          if (slideId === 'smart-board') {
            setSlide({
              id: 'smart-board',
              title: "Order Smart Tolet Board",
              subtitle: "Limited Time Offer",
              description: "Get your smart QR board today with exclusive discounts. Professional marketing for your property.",
              imageUrl: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&q=80&w=1000",
              buttonText: "Order Now",
              link: "/offer/smart-board",
              actionLink: "/checkout/smart-board",
              offerText: "20% OFF TODAY",
              isActive: true,
              order: 1,
              createdAt: new Date().toISOString()
            });
          } else if (slideId === 'promotion') {
            setSlide({
              id: 'promotion',
              title: "Promote for just ₹49",
              subtitle: "Boost Visibility",
              description: "Get your property in front of thousands of potential tenants instantly. First promotion at just ₹49.",
              imageUrl: "https://images.unsplash.com/photo-1582408921715-18e7806365c1?auto=format&fit=crop&q=80&w=1000",
              buttonText: "Promote Now",
              link: "/offer/promotion",
              actionLink: "/checkout/promotion",
              offerText: "₹49 ONLY",
              isActive: true,
              order: 2,
              createdAt: new Date().toISOString()
            });
          } else if (slideId === 'premium') {
            setSlide({
              id: 'premium',
              title: "Privacy & Unlimited Posts",
              subtitle: "Premium Features",
              description: "Take Smart Tolet Board + Privacy features + Free promotion + Unlimited posts. The ultimate package.",
              imageUrl: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=1000",
              buttonText: "Go Premium",
              link: "/offer/premium",
              actionLink: "/checkout/premium",
              offerText: "BEST VALUE",
              isActive: true,
              order: 3,
              createdAt: new Date().toISOString()
            });
          }
        }
      } catch (error) {
        console.error("Failed to load slide details:", error);
      } finally {
        setLoading(false);
      }
    };
    loadSlide();
  }, [slideId]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--bg)]">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-brand border-t-transparent" />
      </div>
    );
  }

  if (!slide) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[var(--bg)] px-6 text-center">
        <h2 className="text-2xl font-bold text-[var(--text-primary)]">Offer not found</h2>
        <button onClick={() => navigate(-1)} className="mt-4 text-brand hover:underline">Go Back</button>
      </div>
    );
  }

  const features = [
    { icon: ShieldCheck, title: "Verified Service", desc: "Trusted by thousands of owners" },
    { icon: Zap, title: "Instant Activation", desc: "Get started in seconds" },
    { icon: Star, title: "Premium Quality", desc: "Best-in-class real estate tools" }
  ];

  return (
    <div className="min-h-screen bg-[var(--bg)] pb-24 pt-24">
      <div className="mx-auto max-w-4xl px-6">
        <button 
          onClick={() => navigate(-1)}
          className="mb-8 flex items-center gap-2 text-sm font-bold text-[var(--text-secondary)] transition-colors hover:text-brand"
        >
          <ArrowLeft size={18} />
          Back to Dashboard
        </button>

        <div className="overflow-hidden rounded-[2.5rem] border border-[var(--border)] bg-[var(--card-bg)] shadow-2xl">
          {/* Hero Image */}
          <div className="relative h-64 w-full md:h-80">
            <img 
              src={slide.imageUrl} 
              alt={slide.title}
              className="h-full w-full object-cover"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[var(--card-bg)] to-transparent" />
            <div className="absolute bottom-8 left-8 right-8">
              <div className="flex items-center gap-2 text-brand">
                <Sparkles size={16} />
                <span className="text-xs font-bold uppercase tracking-widest">{slide.subtitle}</span>
              </div>
              <h1 className="mt-2 text-3xl font-bold text-[var(--text-primary)] md:text-5xl">{slide.title}</h1>
            </div>
          </div>

          {/* Content */}
          <div className="p-8 md:p-12">
            <div className="grid grid-cols-1 gap-12 md:grid-cols-3">
              <div className="md:col-span-2 space-y-8">
                <section>
                  <h2 className="mb-4 text-xl font-bold text-[var(--text-primary)]">About this offer</h2>
                  <p className="text-lg leading-relaxed text-[var(--text-secondary)]">
                    {slide.description}
                  </p>
                </section>

                <section className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div className="rounded-3xl bg-[var(--bg)] p-6 border border-[var(--border)]">
                    <h3 className="mb-3 font-bold text-[var(--text-primary)]">What's included:</h3>
                    <ul className="space-y-3">
                      {['Professional QR Board', 'Real-time Analytics', 'Priority Support', 'Verified Badge'].map((item, i) => (
                        <li key={i} className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
                          <CheckCircle2 size={16} className="text-brand" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="rounded-3xl bg-[var(--bg)] p-6 border border-[var(--border)]">
                    <h3 className="mb-3 font-bold text-[var(--text-primary)]">Benefits:</h3>
                    <ul className="space-y-3">
                      {['Faster Rentals', 'Zero Brokerage', 'Privacy Protection', 'Easy Management'].map((item, i) => (
                        <li key={i} className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
                          <CheckCircle2 size={16} className="text-brand" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </section>
              </div>

              <div className="space-y-6">
                <div className="rounded-3xl bg-brand p-8 text-black shadow-xl shadow-brand/20">
                  <div className="mb-4 text-xs font-bold uppercase tracking-widest opacity-70">Starting From</div>
                  <div className="mb-6 flex items-baseline gap-1">
                    <span className="text-4xl font-black">₹{slide.offerText?.includes('49') ? '49' : '999'}</span>
                    <span className="text-sm font-bold opacity-70">/one-time</span>
                  </div>
                  <button 
                    onClick={() => navigate(slide.actionLink)}
                    className="w-full rounded-2xl bg-black py-4 font-bold text-white transition-transform hover:scale-105"
                  >
                    {slide.buttonText}
                  </button>
                  <p className="mt-4 text-center text-[10px] font-bold opacity-60 uppercase tracking-wider">Secure Payment via PayU</p>
                </div>

                <div className="space-y-4 px-2">
                  {features.map((f, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand/10 text-brand">
                        <f.icon size={20} />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-[var(--text-primary)]">{f.title}</p>
                        <p className="text-[10px] text-[var(--text-secondary)]">{f.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
