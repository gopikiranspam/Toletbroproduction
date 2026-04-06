import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { Slide } from '../types';
import { useNavigate } from 'react-router-dom';

interface SlideshowProps {
  slides: Slide[];
}

export const Slideshow: React.FC<SlideshowProps> = ({ slides }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length);
  };

  if (slides.length === 0) return null;

  const currentSlide = slides[currentIndex];

  return (
    <div className="relative w-full overflow-hidden rounded-3xl bg-[var(--card-bg)] shadow-xl border border-[var(--border)] h-[160px] md:h-[200px]">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
          className="absolute inset-0 flex cursor-pointer items-center"
          onClick={() => navigate(currentSlide.link)}
        >
          {/* Background Image with Overlay */}
          <div className="absolute inset-0 z-0">
            <img 
              src={currentSlide.imageUrl} 
              alt={currentSlide.title}
              className="h-full w-full object-cover opacity-30 blur-[2px]"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[var(--card-bg)] via-[var(--card-bg)]/80 to-transparent" />
          </div>

          {/* Content */}
          <div className="relative z-10 flex h-full w-full flex-col justify-center px-8 md:px-12">
            <div className="flex items-center gap-2 text-brand">
              <Sparkles size={14} />
              <span className="text-[10px] font-bold uppercase tracking-[0.2em]">{currentSlide.subtitle}</span>
            </div>
            <h3 className="mt-1 text-xl font-bold text-[var(--text-primary)] md:text-2xl">
              {currentSlide.title}
            </h3>
            <p className="mt-2 max-w-md text-xs text-[var(--text-secondary)] line-clamp-2">
              {currentSlide.description}
            </p>
            {currentSlide.offerText && (
              <div className="mt-3 inline-flex">
                <span className="rounded-full bg-brand/10 px-3 py-1 text-[10px] font-bold text-brand border border-brand/20">
                  {currentSlide.offerText}
                </span>
              </div>
            )}
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Navigation Controls */}
      {slides.length > 1 && (
        <>
          <button 
            onClick={(e) => { e.stopPropagation(); prevSlide(); }}
            className="absolute left-4 top-1/2 z-20 -translate-y-1/2 rounded-full bg-black/20 p-2 text-white backdrop-blur-sm transition-all hover:bg-brand hover:text-black"
          >
            <ChevronLeft size={16} />
          </button>
          <button 
            onClick={(e) => { e.stopPropagation(); nextSlide(); }}
            className="absolute right-4 top-1/2 z-20 -translate-y-1/2 rounded-full bg-black/20 p-2 text-white backdrop-blur-sm transition-all hover:bg-brand hover:text-black"
          >
            <ChevronRight size={16} />
          </button>

          {/* Indicators */}
          <div className="absolute bottom-4 left-1/2 z-20 flex -translate-x-1/2 gap-1.5">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={(e) => { e.stopPropagation(); setCurrentIndex(i); }}
                className={`h-1 rounded-full transition-all ${i === currentIndex ? 'w-6 bg-brand' : 'w-1.5 bg-white/30'}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};
