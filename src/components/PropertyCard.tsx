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
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      onClick={handleClick}
      className="group relative cursor-pointer overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--card-bg)] transition-all hover:border-brand/50"
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        <img 
          src={property.imageUrl} 
          alt={property.title}
          referrerPolicy="no-referrer"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute top-4 left-4">
          <span className="rounded-full bg-black/50 px-3 py-1 text-xs font-semibold backdrop-blur-md">
            {property.type}
          </span>
        </div>
        <button 
          onClick={(e) => {
            e.stopPropagation();
            // Handle favorite logic
          }}
          className="absolute top-4 right-4 rounded-full bg-black/50 p-2 text-white backdrop-blur-md transition-colors hover:text-red-500"
        >
          <Heart size={18} />
        </button>
        {property.isFeatured && (
          <div className="absolute bottom-4 left-4">
            <span className="rounded-lg bg-brand px-3 py-1 text-xs font-bold text-black uppercase tracking-wider">
              Featured
            </span>
          </div>
        )}
      </div>

      <div className="p-6">
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-lg font-bold tracking-tight line-clamp-1">{property.title}</h3>
          <span className="text-xl font-bold text-brand">
            ₹{(property.price || 0).toLocaleString()}
          </span>
        </div>

        <div className="mb-4 flex items-center gap-1 text-sm text-[var(--text-secondary)]">
          <MapPin size={14} />
          <span className="line-clamp-1">{property.location}</span>
        </div>

        <div className="flex items-center justify-between border-t border-[var(--border)] pt-4">
          <div className="flex items-center gap-1 text-sm text-[var(--text-secondary)]">
            <Bed size={16} className="text-brand" />
            <span>{property.beds || 0} Beds</span>
          </div>
          <div className="flex items-center gap-1 text-sm text-[var(--text-secondary)]">
            <Bath size={16} className="text-brand" />
            <span>{property.baths || 0} Baths</span>
          </div>
          <div className="flex items-center gap-1 text-sm text-[var(--text-secondary)]">
            <Maximize size={16} className="text-brand" />
            <span>{property.sqft || 0} sqft</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
