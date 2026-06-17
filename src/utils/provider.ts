import type { Provider } from '@/types';
import { getProviderName, normalizeAcceptedPets } from './format';

export interface SafeProvider {
  id: string;
  name: string;
  businessName: string;
  displayName: string;
  description: string;
  address: string;
  city?: string;
  latitude: number;
  longitude: number;
  rating: number;
  reviewCount: number;
  acceptedPets: {
    species: string[];
    maxCount: number;
    breedRestrictions: string[];
  };
  photos: any[];
  services: any[];
  availability: any[];
  certified: boolean;
  businessHours: string;
  userId?: string;
  raw: Provider;
}

export const toSafeProvider = (p: any): SafeProvider => {
  return {
    id: p?.id || '',
    name: p?.name || p?.businessName || '',
    businessName: p?.businessName || p?.name || '',
    displayName: getProviderName(p),
    description: p?.description || '',
    address: p?.address || '',
    city: p?.city,
    latitude: p?.latitude || 0,
    longitude: p?.longitude || 0,
    rating: p?.rating || 0,
    reviewCount: p?.reviewCount || 0,
    acceptedPets: normalizeAcceptedPets(p?.acceptedPets),
    photos: p?.photos || [],
    services: p?.services || [],
    availability: p?.availability || [],
    certified: !!p?.certified,
    businessHours: p?.businessHours || '09:00 - 20:00',
    userId: p?.userId || p?.ownerId,
    raw: p,
  };
};

export const getSafeServicePrice = (service: any): number => {
  return Number(service?.dailyPrice ?? service?.pricePerDay ?? 0);
};
