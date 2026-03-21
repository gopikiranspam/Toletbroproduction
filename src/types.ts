export type PropertyType = 'Independent House' | 'Apartment' | 'Standalone Building' | 'Hostel' | 'Commercial';
export type UserRole = 'ADMIN' | 'OWNER' | 'FINDER';
export type PropertyCategory = 'Rent' | 'Sale';
export type BHKType = '1 RK' | '1 BHK' | '2 BHK' | '3 BHK' | '4+ BHK';
export type FurnishingType = 'Unfurnished' | 'Semi-Furnished' | 'Fully Furnished';
export type PreferredTenant = 'Family only' | 'Bachelor' | 'Office Only' | 'Anyone';
export type UserType = 'Owner' | 'Agent';

export interface Property {
  id: string;
  title: string;
  slug: string;
  description: string;
  price: number; // For Rent: monthly rent, For Sale: expected price
  location: string; // Display location (e.g., "Locality, City")
  beds: number; // Derived from BHK Type
  baths: number;
  sqft: number; // Built-up Area
  type: PropertyType;
  category: PropertyCategory;
  imageUrl: string; // Primary image
  images: string[]; // All images
  features: string[]; // Combined amenities and nearby facilities
  isFeatured?: boolean;
  ownerId: string;
  isActive: boolean;
  
  // New detailed fields
  bhkType: BHKType;
  furnishing: FurnishingType;
  locality: string;
  fullAddress: string;
  state: string;
  city: string;
  pincode: string;
  
  // Rent specific
  deposit?: number;
  maintenance?: number;
  
  // Sale specific
  priceNegotiable?: boolean;
  loanAvailable?: boolean;
  
  // Specifications
  floorNumber: number;
  totalFloors: number;
  bathrooms: number;
  preferredTenant: PreferredTenant;
  availableFrom: string;
  
  // Amenities & Facilities
  amenities: string[];
  nearbyFacilities: string[];
  userType: UserType;
  
  // Geolocation
  lat?: number;
  lng?: number;
  
  createdAt: string;
}

export interface User {
  id: string;
  name: string;
  phone: string;
  email?: string;
  role?: UserRole;
  qrId?: string;
  favorites?: string[];
}

export interface Owner extends User {
  role: 'OWNER';
}

export type QRType = 'ADMIN' | 'OWNER';
export type QRStatus = 'UNLINKED' | 'LINKED';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface QRCodeData {
  qrId: string;
  createdBy: QRType;
  ownerId: string | null;
  status: QRStatus;
  createdAt: string;
  publicUrl?: string;
}
