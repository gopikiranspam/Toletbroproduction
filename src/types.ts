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
  distance?: number;
  
  // Dashboard & Stats
  isOccupied?: boolean;
  isDeleted?: boolean;
  scans?: number;
  internalScans?: number;
  views?: number;
  favoritesCount?: number;
  shares?: number;
  callClicks?: number;
  messageClicks?: number;
  
  createdAt: string;
}

export interface User {
  id: string;
  name: string;
  phone: string;
  email?: string;
  role?: UserRole;
  userType?: UserType;
  status?: 'Active' | 'Blocked' | 'Deleted';
  blockReason?: string;
  deleteReason?: string;
  reportCount?: number;
  propertyId?: string;
  qrId?: string;
  favorites?: string[];
  privacy?: PrivacySettings;
}

export interface Order {
  id: string;
  userId: string;
  userName: string;
  userPhone: string;
  amount: number;
  status: 'PENDING' | 'SUCCESS' | 'FAILED';
  txnid: string;
  createdAt: string;
  productInfo: string;
}

export interface Complaint {
  id: string;
  userId: string;
  userName: string;
  userPhone: string;
  subject: string;
  description: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED';
  createdAt: string;
}

export interface Report {
  id: string;
  propertyId: string;
  reporterId: string;
  reporterName: string;
  reason: string;
  details: string;
  status: 'PENDING' | 'INVESTIGATED' | 'DISMISSED';
  createdAt: string;
}

export type DNDReason = 'Busy' | 'Out of station' | 'Not available';

export interface PrivacySettings {
  doNotDisturb: {
    enabled: boolean;
    mode: 'MANUAL' | 'SCHEDULED';
    startDate?: string;
    endDate?: string;
    startTime: string;
    endTime: string;
    reason: DNDReason;
  };
  onlyMessage: boolean;
  preDisclosure: {
    enabled: boolean;
    message: string;
    options: string[];
  };
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

export interface Slide {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  imageUrl: string;
  buttonText: string;
  link: string;
  actionLink: string;
  offerText?: string;
  isActive: boolean;
  order: number;
  createdAt: string;
}
