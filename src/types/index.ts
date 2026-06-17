export type UserRole = 'owner' | 'provider' | 'admin';

export type PetSpecies = 'dog' | 'cat' | 'other';

export type ServiceType = 'daycare' | 'home_visit' | 'boarding';

export type OrderStatus =
  | 'pending_confirm'
  | 'confirmed'
  | 'in_service'
  | 'pending_balance'
  | 'completed'
  | 'cancelled';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar: string;
  role: UserRole;
  createdAt: string;
  providerId?: string;
}

export interface Pet {
  id: string;
  ownerId: string;
  name: string;
  species: PetSpecies;
  breed: string;
  age: number;
  weight?: number;
  avatar?: string;
  description?: string;
  vaccinated?: boolean;
  vaccineRecords?: string[];
  notes?: string;
  createdAt?: string;
}

export interface Service {
  id: string;
  providerId: string;
  type: ServiceType;
  name?: string;
  description: string;
  pricePerDay?: number;
  dailyPrice?: number;
  minDays?: number;
  maxDays?: number;
  includedItems?: string[];
  enabled?: boolean;
}

export interface EnvPhoto {
  id: string;
  providerId?: string;
  url: string;
  caption: string;
  sortOrder?: number;
  uploadedAt?: string;
}

export interface Availability {
  id?: string;
  providerId?: string;
  date: string;
  available?: boolean;
  capacityLeft?: number;
  capacity?: number;
  booked?: number;
  serviceType?: ServiceType;
}

export interface Provider {
  id: string;
  ownerId?: string;
  userId?: string;
  name?: string;
  businessName?: string;
  description: string;
  address: string;
  city?: string;
  latitude: number;
  longitude: number;
  rating: number;
  reviewCount: number;
  acceptedPets: any;
  maxPets?: number;
  photos: EnvPhoto[];
  services: Service[];
  availability: Availability[];
  certified?: boolean;
  businessHours?: string;
  createdAt?: string;
}

export interface Order {
  id: string;
  orderNo?: string;
  ownerId: string;
  providerId: string;
  petId: string;
  serviceId: string;
  serviceType: ServiceType;
  startDate: string;
  endDate: string;
  timeSlot?: string;
  totalPrice?: number;
  deposit?: number;
  totalAmount?: number;
  depositAmount?: number;
  balanceAmount?: number;
  status: OrderStatus;
  specialInstructions?: string;
  pickupAddress?: string;
  dropoffAddress?: string;
  createdAt: string;
  confirmedAt?: string;
  completedAt?: string;
  cancelledAt?: string;
}

export interface Review {
  id: string;
  orderId: string;
  ownerId?: string;
  reviewerId?: string;
  providerId: string;
  rating: number;
  content: string;
  photos?: string[];
  images?: string[];
  reply?: string;
  response?: string;
  createdAt: string;
}

export interface Update {
  id: string;
  orderId?: string;
  providerId: string;
  title?: string;
  content: string;
  images: string[];
  likes?: number;
  createdAt: string;
}

export interface Message {
  id: string;
  orderId?: string;
  senderId: string;
  receiverId?: string;
  content: string;
  type?: string;
  read?: boolean;
  createdAt: string;
}

export interface MockData {
  users: User[];
  pets: Pet[];
  providers: Provider[];
  orders: Order[];
  reviews: Review[];
  updates: Update[];
  messages: Message[];
}
