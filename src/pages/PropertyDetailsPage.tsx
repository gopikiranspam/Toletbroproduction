import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { api } from '../services/api';
import { auth } from '../firebase';
import { Property, Owner } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Bed, 
  Bath, 
  Maximize, 
  MapPin, 
  Phone, 
  MessageSquare, 
  Share2, 
  Heart, 
  Home,
  ChevronLeft,
  ChevronRight,
  Info,
  CheckCircle2,
  Calendar,
  User,
  Building2
} from 'lucide-react';

import { useAuth } from '../context/AuthContext';

import { isDNDActive } from '../utils/privacy';

export const PropertyDetailsPage: React.FC = () => {
  const { propertySlugId } = useParams<{ propertySlugId: string }>();
  const [searchParams] = useSearchParams();
  const { user, openAuth, toggleFavorite: toggleFavoriteInContext } = useAuth();
  const [property, setProperty] = useState<Property | null>(null);
  const [owner, setOwner] = useState<Owner | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [disclosureAccepted, setDisclosureAccepted] = useState(false);
  
  const isFavorite = property ? user?.favorites?.includes(property.id) : false;

  const dndActive = isDNDActive(owner?.privacy);

  useEffect(() => {
    if (propertySlugId) {
      const idMatch = propertySlugId.match(/(prop-.*)$/);
      const id = idMatch ? idMatch[1] : propertySlugId;
      
      const fetchData = async () => {
        setLoading(true);
        try {
          const p = await api.getPropertyById(id);
          if (p) {
            setProperty(p);
            
            // Record view
            api.incrementPropertyStat(id, 'views');
            
            // Record scan if source is QR
            if (searchParams.get('source') === 'qr') {
              if (searchParams.get('internal') === 'true') {
                api.incrementPropertyStat(id, 'internalScans');
              } else {
                api.incrementPropertyStat(id, 'scans');
              }
            }

            const o = await api.getOwnerById(p.ownerId);
            if (o) setOwner(o);
          }
        } catch (error) {
          console.error("Error fetching property details:", error);
        } finally {
          setLoading(false);
        }
      };
      fetchData();
    }
  }, [propertySlugId, searchParams]);

  const handleShare = async () => {
    if (!property) return;
    
    const shareData = {
      title: property.title,
      text: `Check out this property: ${property.title}`,
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
        api.incrementPropertyStat(property.id, 'shares');
      } else {
        await navigator.clipboard.writeText(window.location.href);
        alert('Link copied to clipboard!');
        api.incrementPropertyStat(property.id, 'shares');
      }
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const handleToggleFavorite = async () => {
    if (!property) return;
    if (!user) {
      openAuth();
      return;
    }

    await toggleFavoriteInContext(property.id);
  };

  const handleContactClick = (type: 'call' | 'message') => {
    if (!property) return;
    api.incrementPropertyStat(property.id, type === 'call' ? 'callClicks' : 'messageClicks');
  };

  if (loading) return (
    <div className="flex h-screen flex-col items-center justify-center gap-4">
      <div className="h-12 w-12 animate-spin rounded-full border-4 border-brand border-t-transparent"></div>
      <p className="font-medium text-white/60">Loading property details...</p>
    </div>
  );

  if (!property) return (
    <div className="flex h-screen flex-col items-center justify-center gap-4">
      <div className="rounded-full bg-red-500/10 p-6 text-red-500">
        <Info size={48} />
      </div>
      <h2 className="text-2xl font-bold">Property not found</h2>
      <p className="text-white/60">The property you're looking for might have been removed.</p>
    </div>
  );

  const allImages = property.images && property.images.length > 0 ? property.images : [property.imageUrl];

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % allImages.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + allImages.length) % allImages.length);
  };

  return (
    <div className="mx-auto max-w-7xl px-6 py-12">
      <div className="grid grid-cols-1 gap-12 lg:grid-cols-3">
        {/* Left Column: Images & Details */}
        <div className="lg:col-span-2">
          {/* Image Gallery */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="group relative mb-8 aspect-video overflow-hidden rounded-[2.5rem] border border-white/10 bg-white/5 shadow-2xl"
          >
            <AnimatePresence mode="wait">
              <motion.img 
                key={currentImageIndex}
                src={allImages[currentImageIndex] || null} 
                alt={`${property.title} - ${currentImageIndex + 1}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
                referrerPolicy="no-referrer"
                className="h-full w-full object-cover"
              />
            </AnimatePresence>

            {/* Navigation Arrows */}
            {allImages.length > 1 && (
              <>
                <button 
                  onClick={prevImage}
                  className="absolute left-6 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-3 text-white backdrop-blur-md transition-all hover:bg-brand hover:text-black opacity-0 group-hover:opacity-100"
                >
                  <ChevronLeft size={24} />
                </button>
                <button 
                  onClick={nextImage}
                  className="absolute right-6 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-3 text-white backdrop-blur-md transition-all hover:bg-brand hover:text-black opacity-0 group-hover:opacity-100"
                >
                  <ChevronRight size={24} />
                </button>
              </>
            )}

            {/* Image Counter */}
            <div className="absolute bottom-6 right-6 rounded-full bg-black/50 px-4 py-2 text-xs font-bold text-white backdrop-blur-md">
              {currentImageIndex + 1} / {allImages.length}
            </div>

            <div className="absolute top-6 right-6 flex gap-3">
              <button 
                onClick={handleShare}
                className="rounded-full bg-black/50 p-3 text-white backdrop-blur-md transition-colors hover:bg-white/20"
              >
                <Share2 size={20} />
              </button>
              <button 
                onClick={handleToggleFavorite}
                className={`rounded-full bg-black/50 p-3 backdrop-blur-md transition-colors hover:bg-white/20 ${isFavorite ? 'text-brand' : 'text-white'}`}
              >
                <Heart size={20} fill={isFavorite ? "currentColor" : "none"} />
              </button>
            </div>
          </motion.div>

          {/* Thumbnail Strip */}
          {allImages.length > 1 && (
            <div className="mb-8 flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
              {allImages.map((img, idx) => (
                <button 
                  key={idx}
                  onClick={() => setCurrentImageIndex(idx)}
                  className={`relative h-20 w-32 flex-shrink-0 overflow-hidden rounded-2xl border-2 transition-all ${
                    currentImageIndex === idx ? 'border-brand' : 'border-transparent opacity-60 hover:opacity-100'
                  }`}
                >
                  <img src={img || null} alt="" className="h-full w-full object-cover" referrerPolicy="no-referrer" />
                </button>
              ))}
            </div>
          )}

          <div className="mb-8">
            <div className="mb-4 flex items-center gap-2">
              <span className="rounded-full bg-brand/10 px-4 py-1 text-xs font-bold text-brand uppercase tracking-widest">
                {property.category} • {property.type}
              </span>
              <span className="text-sm text-white/40">ID: {property.id}</span>
            </div>
            <h1 className="mb-4 text-3xl font-bold tracking-tight md:text-5xl">{property.title}</h1>
            <div className="flex items-center gap-2 text-lg text-white/60">
              <MapPin size={20} className="text-brand" />
              <span>{property.fullAddress || property.location}</span>
            </div>
            {property.locality && (
              <p className="mt-2 text-sm text-white/40">
                {property.locality}, {property.city}, {property.state} - {property.pincode || property.zipCode}
              </p>
            )}
          </div>

          <div className="mb-12 grid grid-cols-2 gap-6 rounded-3xl border border-white/10 bg-white/5 p-8 sm:grid-cols-4">
            <div className="text-center">
              <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-2xl bg-brand/10 text-brand">
                <Bed size={24} />
              </div>
              <p className="text-xl font-bold">{property.bhkType || `${property.beds} BHK`}</p>
              <p className="text-xs font-bold uppercase tracking-widest text-white/30">BHK Type</p>
            </div>
            <div className="text-center">
              <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-2xl bg-brand/10 text-brand">
                <Bath size={24} />
              </div>
              <p className="text-xl font-bold">{property.bathrooms || property.baths}</p>
              <p className="text-xs font-bold uppercase tracking-widest text-white/30">Bathrooms</p>
            </div>
            <div className="text-center">
              <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-2xl bg-brand/10 text-brand">
                <Maximize size={24} />
              </div>
              <p className="text-xl font-bold">{property.sqft}</p>
              <p className="text-xs font-bold uppercase tracking-widest text-white/30">Square Ft</p>
            </div>
            <div className="text-center">
              <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-2xl bg-brand/10 text-brand">
                <Home size={24} />
              </div>
              <p className="text-xl font-bold">{property.furnishing}</p>
              <p className="text-xs font-bold uppercase tracking-widest text-white/30">Furnishing</p>
            </div>
          </div>

          <div className="mb-12 grid grid-cols-1 gap-8 md:grid-cols-2">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-8">
              <h3 className="mb-6 flex items-center gap-2 text-xl font-bold">
                <Building2 size={20} className="text-brand" />
                Property Specifications
              </h3>
              <ul className="space-y-4">
                <li className="flex justify-between border-b border-white/5 pb-2">
                  <span className="text-white/50">Floor Number</span>
                  <span className="font-bold">{property.floorNumber} of {property.totalFloors}</span>
                </li>
                <li className="flex justify-between border-b border-white/5 pb-2">
                  <span className="text-white/50">Preferred Tenant</span>
                  <span className="font-bold">{property.preferredTenant}</span>
                </li>
                <li className="flex justify-between border-b border-white/5 pb-2">
                  <span className="text-white/50">Available From</span>
                  <span className="font-bold">{property.availableFrom}</span>
                </li>
                <li className="flex justify-between">
                  <span className="text-white/50">Listed By</span>
                  <span className="font-bold">{property.userType || 'Owner'}</span>
                </li>
              </ul>
            </div>

            {property.category === 'Rent' && (
              <div className="rounded-3xl border border-white/10 bg-white/5 p-8">
                <h3 className="mb-6 flex items-center gap-2 text-xl font-bold">
                  <Info size={20} className="text-brand" />
                  Pricing Details
                </h3>
                <ul className="space-y-4">
                  <li className="flex justify-between border-b border-white/5 pb-2">
                    <span className="text-white/50">Monthly Rent</span>
                    <span className="font-bold text-brand">₹{property.price.toLocaleString()}</span>
                  </li>
                  <li className="flex justify-between border-b border-white/5 pb-2">
                    <span className="text-white/50">Security Deposit</span>
                    <span className="font-bold">₹{property.deposit?.toLocaleString() || 'N/A'}</span>
                  </li>
                  <li className="flex justify-between">
                    <span className="text-white/50">Maintenance</span>
                    <span className="font-bold">₹{property.maintenance?.toLocaleString() || '0'}</span>
                  </li>
                </ul>
              </div>
            )}

            {property.category === 'Sale' && (
              <div className="rounded-3xl border border-white/10 bg-white/5 p-8">
                <h3 className="mb-6 flex items-center gap-2 text-xl font-bold">
                  <Info size={20} className="text-brand" />
                  Sale Details
                </h3>
                <ul className="space-y-4">
                  <li className="flex justify-between border-b border-white/5 pb-2">
                    <span className="text-white/50">Expected Price</span>
                    <span className="font-bold text-brand">₹{property.price.toLocaleString()}</span>
                  </li>
                  <li className="flex justify-between border-b border-white/5 pb-2">
                    <span className="text-white/50">Negotiable</span>
                    <span className="font-bold">{property.priceNegotiable ? 'Yes' : 'No'}</span>
                  </li>
                  <li className="flex justify-between">
                    <span className="text-white/50">Loan Available</span>
                    <span className="font-bold">{property.loanAvailable ? 'Yes' : 'No'}</span>
                  </li>
                </ul>
              </div>
            )}
          </div>

          <div className="mb-12">
            <h2 className="mb-6 text-2xl font-bold">Description</h2>
            <p className="whitespace-pre-line text-lg leading-relaxed text-white/60">{property.description}</p>
          </div>

          <div className="mb-12">
            <h2 className="mb-6 text-2xl font-bold">Amenities</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
              {(property.amenities || []).length > 0 ? (
                property.amenities.map((amenity, i) => (
                  <div key={i} className="flex items-center gap-3 rounded-2xl border border-white/5 bg-white/5 px-6 py-4">
                    <CheckCircle2 size={18} className="text-brand" />
                    <span className="text-sm font-medium">{amenity}</span>
                  </div>
                ))
              ) : (
                <p className="text-white/40">No specific amenities listed.</p>
              )}
            </div>
          </div>

          <div className="mb-12">
            <h2 className="mb-6 text-2xl font-bold">Nearby Facilities</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
              {(property.nearbyFacilities || []).length > 0 ? (
                property.nearbyFacilities.map((facility, i) => (
                  <div key={i} className="flex items-center gap-3 rounded-2xl border border-white/5 bg-white/5 px-6 py-4">
                    <MapPin size={18} className="text-brand" />
                    <span className="text-sm font-medium">{facility}</span>
                  </div>
                ))
              ) : (
                <p className="text-white/40">No nearby facilities listed.</p>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Pricing & Contact */}
        <div className="lg:col-span-1">
          <div className="sticky top-32 space-y-8">
            <div className="rounded-[2.5rem] border border-white/10 bg-[#111111] p-8 shadow-2xl">
              <div className="mb-8">
                <p className="text-sm font-bold uppercase tracking-widest text-white/30">
                  {property.category === 'Rent' ? 'Monthly Rent' : 'Expected Price'}
                </p>
                <p className="text-4xl font-bold text-brand">₹{property.price.toLocaleString()}</p>
                {property.category === 'Rent' && property.maintenance > 0 && (
                  <p className="mt-1 text-xs text-white/40">+ ₹{property.maintenance} Maintenance</p>
                )}
              </div>

              <div className="mb-8 space-y-4">
                {owner?.privacy?.preDisclosure?.enabled && !disclosureAccepted ? (
                  <div className="rounded-2xl border border-brand/20 bg-brand/5 p-6">
                    <div className="mb-4 flex items-start gap-3 text-sm text-brand">
                      <Info size={18} className="shrink-0 mt-0.5" />
                      <p className="font-medium leading-relaxed">
                        {owner.privacy.preDisclosure.message || "Serious tenants only, Please contact me only when you agree below terms & conditions"}
                      </p>
                    </div>
                    
                    {owner.privacy.preDisclosure.options && owner.privacy.preDisclosure.options.length > 0 && (
                      <div className="mb-6 space-y-2">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-white/30">Owner Preferences</p>
                        <div className="flex flex-wrap gap-2">
                          {owner.privacy.preDisclosure.options.map((opt: string) => (
                            <span key={opt} className="rounded-lg bg-white/5 px-3 py-1.5 text-[10px] font-medium text-white/60 border border-white/10">
                              {opt}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    <button 
                      onClick={() => setDisclosureAccepted(true)}
                      className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand py-3 text-sm font-bold text-black transition-transform hover:scale-[1.02]"
                    >
                      <CheckCircle2 size={18} />
                      <span>Accept & View Contact</span>
                    </button>
                  </div>
                ) : (
                  <>
                    {dndActive ? (
                      <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-6 text-center">
                        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-red-500/10 text-red-500">
                          <Calendar size={24} />
                        </div>
                        <h4 className="mb-1 font-bold text-red-500">Owner is Busy</h4>
                        <p className="text-xs text-white/60">
                          Reason: <span className="font-bold text-white/80">{owner?.privacy?.doNotDisturb?.reason}</span>
                        </p>
                        <p className="mt-2 text-[10px] text-white/40 italic">
                          Please try again after {owner?.privacy?.doNotDisturb?.endTime}
                        </p>
                      </div>
                    ) : (
                      <>
                        {!owner?.privacy?.onlyMessage && (
                          <a 
                            href={`tel:${owner?.phone || ''}`}
                            onClick={() => handleContactClick('call')}
                            className="flex w-full items-center justify-center gap-3 rounded-2xl bg-brand py-4 font-bold text-black transition-transform hover:scale-[1.02]"
                          >
                            <Phone size={20} />
                            <span>Call Owner</span>
                          </a>
                        )}
                        
                        {owner?.privacy?.onlyMessage && (
                          <div className="rounded-2xl border border-indigo-500/20 bg-indigo-500/5 p-4 text-xs text-indigo-400 flex gap-3 items-start">
                            <Info size={16} className="shrink-0 mt-0.5" />
                            <p>Owner not accepting the calls this time, please make whatsapp message.</p>
                          </div>
                        )}

                        <a 
                          href={`https://wa.me/${owner?.phone?.replace(/\D/g, '') || ''}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={() => handleContactClick('message')}
                          className="flex w-full items-center justify-center gap-3 rounded-2xl border border-white/10 bg-white/5 py-4 font-bold transition-transform hover:scale-[1.02]"
                        >
                          <MessageSquare size={20} />
                          <span>Chat on WhatsApp</span>
                        </a>
                      </>
                    )}
                  </>
                )}
              </div>

              {owner && (
                <div className="border-t border-white/5 pt-8">
                  <p className="mb-4 text-xs font-bold uppercase tracking-widest text-white/30">Listed By</p>
                  <div className="flex items-center gap-4">
                    <div className="h-14 w-14 rounded-full bg-brand/20 flex items-center justify-center text-brand font-bold text-xl">
                      {owner.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-bold">{owner.name}</p>
                      <p className="text-xs text-white/40">Verified {property.userType}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="rounded-[2.5rem] border border-white/10 bg-brand/5 p-8">
              <h3 className="mb-4 flex items-center gap-2 text-lg font-bold">
                <Info size={18} className="text-brand" />
                Safety Tips
              </h3>
              <ul className="space-y-3 text-sm text-white/50">
                <li className="flex gap-2">
                  <span className="text-brand">•</span>
                  <span>Never pay in advance without visiting the property.</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-brand">•</span>
                  <span>Verify property documents in person with the owner.</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-brand">•</span>
                  <span>Meet the owner in a public place for the first time.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

