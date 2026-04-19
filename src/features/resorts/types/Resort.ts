export interface ResortLocation {
  address: string;
  city: string;
  state: string;
  pincode?: string;
  coordinates?: {
    lat?: number;
    lng?: number;
  };
}

export interface ResortFacilities {
  roomFeatures?: string[];
  bathroom?: string[];
  bedType?: string[];
  propertyFeatures?: string[];
  activities?: string[];
  dining?: string[];
  services?: string[];
  parking: boolean;
  petFriendly: boolean;
  safety?: string[];
}

export interface ResortPolicies {
  cancellation: string;
  childPolicy: string;
  extraBedPolicy: string;
}

export interface Resort {
  _id?: string;
  name: string;
  description: string;
  location: ResortLocation;
  pricePerNight: number;
  images: string[];

  amenities?: string[];
  facilities: ResortFacilities;

  checkIn: string;
  checkOut: string;

  policies: ResortPolicies;

  maxGuests: number;
  rooms: number;
  roomTypes?: string[];
  isAvailable: boolean;
  rating: number;
  totalReviews: number;
  featured: boolean;
  category: 'luxury' | 'budget' | 'eco' | 'adventure';
  createdBy?: string;

  createdAt?: Date;
  updatedAt?: Date;
}