import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { Property } from '../types';
import { PropertyCard } from '../components/PropertyCard';
import { FilterBar } from '../components/FilterBar';
import { motion } from 'motion/react';
import { MapPin, SlidersHorizontal, Loader2 } from 'lucide-react';

export const SearchPage: React.FC = () => {
  const { city, area } = useParams<{ city: string; area?: string }>();
  const [properties, setProperties] = useState<Property[]>([]);
  const [selectedType, setSelectedType] = useState('All');
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    if (city) {
      api.getPropertiesByLocation(city, area).then(data => {
        setProperties(data);
        setLoading(false);
        
        // If only one property found, redirect to details
        if (data.length === 1) {
          const p = data[0];
          const slug = p.slug || p.title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');
          navigate(`/property/${slug}-${p.id}`, { replace: true });
        }
      });
    }
  }, [city, area, navigate]);

  const filteredProperties = properties.filter(p => 
    selectedType === 'All' ? true : p.type === selectedType
  );

  if (loading || (properties.length === 1)) return (
    <div className="flex h-screen flex-col items-center justify-center gap-4 text-[var(--text-primary)]">
      <Loader2 className="h-12 w-12 animate-spin text-brand" />
      <p className="text-white/50">{properties.length === 1 ? 'Redirecting to property...' : 'Searching properties...'}</p>
    </div>
  );

  return (
    <div className="mx-auto max-w-7xl px-6 py-12">
      <div className="mb-12 flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="mb-4 flex items-center gap-2 text-brand">
            <MapPin size={20} />
            <span className="text-sm font-bold uppercase tracking-widest">Search Results</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight md:text-5xl text-[var(--text-primary)]">
            Properties in {area ? `${area}, ` : ''}{city}
          </h1>
          <p className="mt-2 text-[var(--text-secondary)]">Found {filteredProperties.length} properties matching your search.</p>
        </div>
        
        <button className="flex items-center gap-2 rounded-2xl border border-[var(--border)] bg-[var(--card-bg)] px-6 py-3 text-sm font-medium text-[var(--text-primary)] transition-colors hover:bg-brand hover:text-black">
          <SlidersHorizontal size={18} />
          <span>Filters</span>
        </button>
      </div>

      <div className="mb-12">
        <FilterBar selectedType={selectedType} onSelectType={setSelectedType} />
      </div>

      <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {filteredProperties.map((property) => (
          <PropertyCard key={property.id} property={property} />
        ))}
      </div>

      {filteredProperties.length === 0 && (
        <div className="flex flex-col items-center justify-center py-32 text-center">
          <p className="text-xl text-[var(--text-secondary)]/40">No properties found in this location.</p>
        </div>
      )}
    </div>
  );
};
