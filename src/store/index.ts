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
  receiverId?: string;
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
  updateProvider: (providerId: string, updates: Partial<Provider>) => void;
  addReview: (reviewData: AddReviewData) => Review;
  addUpdate: (updateData: AddUpdateData) => Update;
  addMessage: (messageData: AddMessageData) => Message;
  confirmOrder: (orderId: string) => void;
  payBalance: (orderId: string) => void;
}

const generateOrderNo = () => 'PB' + Date.now().toString().slice(-10);

const STORAGE_KEY_MESSAGES = 'petboard_messages';

const loadMessages = (): Message[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY_MESSAGES);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {}
  return [...messages];
};

const saveMessages = (msgs: Message[]) => {
  try {
    localStorage.setItem(STORAGE_KEY_MESSAGES, JSON.stringify(msgs));
  } catch {}
};

export const useAppStore = create<AppStore>((set, get) => ({
  currentUser: null,
  users: [...users],
  pets: [...pets],
  providers: [...providers],
  orders: [...orders],
  reviews: [...reviews],
  updates: [...updates],
  messages: loadMessages(),

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
      totalAmount: orderData.totalAmount,
      totalPrice: orderData.totalAmount,
      depositAmount: orderData.depositAmount,
      deposit: orderData.depositAmount,
      balanceAmount: orderData.balanceAmount,
    } as Order;
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

  updateProvider: (providerId: string, updates: Partial<Provider>) => {
    set((state) => ({
      providers: state.providers.map((p) =>
        p.id === providerId ? { ...p, ...updates } : p
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
      receiverId: messageData.receiverId || '',
      read: false,
    };
    set((state) => {
      const updated = [...state.messages, newMessage];
      saveMessages(updated);
      return { messages: updated };
    });
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
      orders: state.orders.map((o) => {
        if (o.id !== orderId) return o;
        const total = Number((o as any).totalAmount ?? (o as any).totalPrice ?? 0);
        return {
          ...o,
          status: 'completed' as OrderStatus,
          balancePaidAt: new Date().toISOString(),
          paidAmount: total,
        } as Order;
      }),
    }));
  },
}));

export default useAppStore;
export { mockData };
