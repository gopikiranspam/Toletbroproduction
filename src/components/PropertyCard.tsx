import React from 'react';
import { Bed, Bath, Maximize, MapPin, Heart } from 'lucide-react';
import { Property } from '../types';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';

interface PropertyCardProps {
  property: Property;
}

export const PropertyCard: React.FC<PropertyCardProps> = ({ property }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    const slug = property.slug || property.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    navigate(`/property/${slug}-${property.id}`);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      onClick={handleClick}
      className="group relative cursor-pointer overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--card-bg)] transition-all hover:shadow-xl hover:shadow-brand/5"
    >
      <div className="relative aspect-[16/10] overflow-hidden">
        <img 
          src={property.imageUrl} 
          alt={property.title}
          referrerPolicy="no-referrer"
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute top-3 left-3 flex gap-2">
          <span className="rounded-lg bg-black/40 px-2 py-1 text-[10px] font-bold text-white backdrop-blur-md uppercase tracking-wider">
            {property.type}
          </span>
          {property.isFeatured && (
            <span className="rounded-lg bg-brand px-2 py-1 text-[10px] font-bold text-black uppercase tracking-wider">
              Featured
            </span>
          )}
        </div>
        <button 
          onClick={(e) => {
            e.stopPropagation();
          }}
          className="absolute top-3 right-3 rounded-full bg-black/40 p-1.5 text-white backdrop-blur-md transition-colors hover:text-brand"
        >
          <Heart size={14} />
        </button>
        <div className="absolute bottom-3 right-3">
          <div className="rounded-lg bg-brand px-3 py-1 text-sm font-bold text-black shadow-lg">
            ₹{(property.price || 0).toLocaleString()}
          </div>
        </div>
      </div>

      <div className="p-4">
        <h3 className="mb-1 text-sm font-bold tracking-tight text-[var(--text-primary)] line-clamp-1 group-hover:text-brand transition-colors">
          {property.title}
        </h3>
        
        <div className="mb-3 flex items-center gap-1 text-[10px] font-medium text-[var(--text-secondary)]">
          <MapPin size={10} className="text-brand" />
          <span className="line-clamp-1">{property.location}</span>
        </div>

        <div className="flex items-center gap-4 border-t border-[var(--border)] pt-3">
          <div className="flex items-center gap-1 text-[10px] font-bold text-[var(--text-secondary)]">
            <Bed size={12} className="text-brand" />
            <span>{property.beds || 0} BHK</span>
          </div>
          <div className="flex items-center gap-1 text-[10px] font-bold text-[var(--text-secondary)]">
            <Maximize size={12} className="text-brand" />
            <span>{property.sqft || 0} ft²</span>
          </div>
          <div className="ml-auto flex items-center gap-1 text-[10px] font-bold text-brand">
            <span>Details</span>
            <Maximize size={10} />
          </div>
        </div>
      </div>
    </motion.div>
  );
};
