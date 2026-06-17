import { create } from 'zustand';
import {
  mockData,
  users,
  pets,
  providers,
  orders,
  reviews,
  updates,
  messages,
} from '../data/mockData';
import type {
  User,
  Pet,
  Provider,
  Order,
  Review,
  Update,
  Message,
  OrderStatus,
} from '../types';

export interface CreateOrderData {
  ownerId: string;
  providerId: string;
  petId: string;
  serviceId: string;
  serviceType: Order['serviceType'];
  startDate: string;
  endDate: string;
  timeSlot: string;
  totalAmount: number;
  depositAmount: number;
  balanceAmount: number;
}

export interface AddReviewData {
  orderId: string;
  reviewerId: string;
  providerId: string;
  rating: number;
  content: string;
  images?: string[];
}

export interface AddUpdateData {
  orderId: string;
  providerId: string;
  content: string;
  images?: string[];
}

export interface AddMessageData {
  orderId: string;
  senderId: string;
  content: string;
  type?: 'text' | 'image';
}

export interface AppStore {
  currentUser: User | null;
  users: User[];
  pets: Pet[];
  providers: Provider[];
  orders: Order[];
  reviews: Review[];
  updates: Update[];
  messages: Message[];

  login: (userId: string) => void;
  logout: () => void;
  createOrder: (orderData: CreateOrderData) => Order;
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  addReview: (reviewData: AddReviewData) => Review;
  addUpdate: (updateData: AddUpdateData) => Update;
  addMessage: (messageData: AddMessageData) => Message;
  confirmOrder: (orderId: string) => void;
  payBalance: (orderId: string) => void;
}

const generateOrderNo = () => 'PB' + Date.now().toString().slice(-10);

export const useAppStore = create<AppStore>((set, get) => ({
  currentUser: null,
  users: [...users],
  pets: [...pets],
  providers: [...providers],
  orders: [...orders],
  reviews: [...reviews],
  updates: [...updates],
  messages: [...messages],

  login: (userId: string) => {
    const foundUser = get().users.find((u) => u.id === userId) || null;
    set({ currentUser: foundUser });
  },

  logout: () => {
    set({ currentUser: null });
  },

  createOrder: (orderData: CreateOrderData) => {
    const newOrder: Order = {
      id: 'o' + Date.now().toString(),
      orderNo: generateOrderNo(),
      status: 'pending_confirm',
      createdAt: new Date().toISOString(),
      ...orderData,
    };
    set((state) => ({
      orders: [newOrder, ...state.orders],
    }));
    return newOrder;
  },

  updateOrderStatus: (orderId: string, status: OrderStatus) => {
    set((state) => ({
      orders: state.orders.map((o) =>
        o.id === orderId ? { ...o, status } : o
      ),
    }));
  },

  addReview: (reviewData: AddReviewData) => {
    const newReview: Review = {
      id: 'r' + Date.now().toString(),
      images: [],
      createdAt: new Date().toISOString(),
      ...reviewData,
    };
    set((state) => ({
      reviews: [newReview, ...state.reviews],
    }));
    return newReview;
  },

  addUpdate: (updateData: AddUpdateData) => {
    const newUpdate: Update = {
      id: 'up' + Date.now().toString(),
      images: [],
      createdAt: new Date().toISOString(),
      ...updateData,
    };
    set((state) => ({
      updates: [newUpdate, ...state.updates],
    }));
    return newUpdate;
  },

  addMessage: (messageData: AddMessageData) => {
    const newMessage: Message = {
      id: 'm' + Date.now().toString(),
      type: 'text',
      createdAt: new Date().toISOString(),
      ...messageData,
    };
    set((state) => ({
      messages: [...state.messages, newMessage],
    }));
    return newMessage;
  },

  confirmOrder: (orderId: string) => {
    set((state) => ({
      orders: state.orders.map((o) =>
        o.id === orderId ? { ...o, status: 'confirmed' as OrderStatus } : o
      ),
    }));
  },

  payBalance: (orderId: string) => {
    set((state) => ({
      orders: state.orders.map((o) =>
        o.id === orderId ? { ...o, status: 'completed' as OrderStatus } : o
      ),
    }));
  },
}));

export default useAppStore;
export { mockData };
