import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Check, Home, Building2, Building, Hotel, Store } from 'lucide-react';
import { PropertyCategory, BHKType, PropertyType } from '../types';

interface PreferenceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (preferences: { category?: PropertyCategory; bhkType?: BHKType; propertyType?: PropertyType }) => void;
}

const BHK_OPTIONS: BHKType[] = ['1 RK', '1 BHK', '2 BHK', '3 BHK', '4+ BHK'];
const PROPERTY_TYPES: { type: PropertyType; icon: any }[] = [
  { type: 'Independent House', icon: Home },
  { type: 'Apartment', icon: Building2 },
  { type: 'Standalone Building', icon: Building },
  { type: 'Hostel', icon: Hotel },
  { type: 'Commercial', icon: Store }
];

export const PreferenceModal: React.FC<PreferenceModalProps> = ({ isOpen, onClose, onSave }) => {
  const [category, setCategory] = useState<PropertyCategory | undefined>();
  const [bhkType, setBhkType] = useState<BHKType | undefined>();
  const [propertyType, setPropertyType] = useState<PropertyType | undefined>();

  const handleSave = () => {
    onSave({ category, bhkType, propertyType });
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center px-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
          />
          
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative w-full max-w-lg overflow-hidden rounded-[2.5rem] border border-white/10 bg-[#0A0A0A] p-8 shadow-2xl"
          >
            <div className="mb-8 text-center">
              <h2 className="text-3xl font-bold text-white">Personalize Your <span className="text-brand">Search</span></h2>
              <p className="mt-2 text-sm text-gray-400">Help us find the perfect property for you.</p>
            </div>

            <div className="space-y-8">
              {/* Category */}
              <div className="space-y-4">
                <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500">What are you looking for?</label>
                <div className="grid grid-cols-2 gap-3">
                  {(['Rent', 'Sale'] as PropertyCategory[]).map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setCategory(cat)}
                      className={`flex items-center justify-center gap-2 rounded-2xl border py-4 text-sm font-bold transition-all ${
                        category === cat
                          ? 'border-brand bg-brand/10 text-brand'
                          : 'border-white/5 bg-white/5 text-gray-400 hover:bg-white/10'
                      }`}
                    >
                      {cat === 'Rent' ? 'Rent' : 'Buy'}
                      {category === cat && <Check size={16} />}
                    </button>
                  ))}
                </div>
              </div>

              {/* BHK Type */}
              <div className="space-y-4">
                <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Preferred Configuration</label>
                <div className="flex flex-wrap gap-2">
                  {BHK_OPTIONS.map((type) => (
                    <button
                      key={type}
                      onClick={() => setBhkType(type)}
                      className={`rounded-xl border px-4 py-2 text-xs font-bold transition-all ${
                        bhkType === type
                          ? 'border-brand bg-brand text-black'
                          : 'border-white/5 bg-white/5 text-gray-400 hover:bg-white/10'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              {/* Property Type */}
              <div className="space-y-4">
                <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Property Type</label>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {PROPERTY_TYPES.map(({ type, icon: Icon }) => (
                    <button
                      key={type}
                      onClick={() => setPropertyType(type)}
                      className={`flex flex-col items-center gap-2 rounded-2xl border p-4 text-center transition-all ${
                        propertyType === type
                          ? 'border-brand bg-brand/10 text-brand'
                          : 'border-white/5 bg-white/5 text-gray-400 hover:bg-white/10'
                      }`}
                    >
                      <Icon size={20} />
                      <span className="text-[10px] font-bold">{type}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-10 flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 rounded-2xl border border-white/5 bg-white/5 py-4 text-sm font-bold text-gray-400 transition-all hover:bg-white/10"
              >
                Skip
              </button>
              <button
                onClick={handleSave}
                disabled={!category && !bhkType && !propertyType}
                className="flex-1 rounded-2xl bg-brand py-4 text-sm font-bold text-black shadow-lg shadow-brand/20 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:hover:scale-100"
              >
                Save Preferences
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
