import type { ServiceType, OrderStatus } from '../types';

export const formatCurrency = (amount: number): string => {
  if (isNaN(amount) || amount === null || amount === undefined) return '¥0.00';
  return '¥' + amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

export const formatDistance = (meters: number): string => {
  if (isNaN(meters) || meters < 0) return '0m';
  if (meters < 1000) {
    return Math.round(meters) + 'm';
  }
  return (meters / 1000).toFixed(1) + 'km';
};

export const getServiceLabel = (type: ServiceType): string => {
  const map: Record<ServiceType, string> = {
    daycare: '日间照料',
    home_visit: '上门喂养',
    boarding: '住宿寄养',
  };
  return map[type] || type;
};

export const getStatusLabel = (status: OrderStatus): string => {
  const map: Record<OrderStatus, string> = {
    pending_confirm: '待确认',
    confirmed: '已确认',
    in_service: '服务中',
    pending_balance: '待结算',
    completed: '已完成',
    cancelled: '已取消',
  };
  return map[status] || status;
};

export const getStatusColor = (status: OrderStatus): string => {
  const map: Record<OrderStatus, string> = {
    pending_confirm: 'bg-amber-100 text-amber-700 border-amber-200',
    confirmed: 'bg-blue-100 text-blue-700 border-blue-200',
    in_service: 'bg-green-100 text-green-700 border-green-200',
    pending_balance: 'bg-purple-100 text-purple-700 border-purple-200',
    completed: 'bg-gray-100 text-gray-700 border-gray-200',
    cancelled: 'bg-red-100 text-red-700 border-red-200',
  };
  return map[status] || 'bg-gray-100 text-gray-700 border-gray-200';
};

export const generateOrderNo = (): string => {
  return 'PB' + Date.now().toString().slice(-10);
};

export const getProviderName = (provider: any): string => {
  return provider?.businessName || provider?.name || '未命名商家';
};

export const getServiceDailyPrice = (service: any): number => {
  return Number(service?.dailyPrice ?? service?.pricePerDay ?? 0);
};

export const getOrderTotal = (order: any): number => {
  return Number(order?.totalAmount ?? order?.totalPrice ?? 0);
};

export const getOrderDeposit = (order: any): number => {
  return Number(order?.depositAmount ?? order?.deposit ?? 0);
};

export const getOrderBalance = (order: any): number => {
  if (typeof order?.balanceAmount === 'number') return order.balanceAmount;
  const total = getOrderTotal(order);
  const dep = getOrderDeposit(order);
  return Math.round((total - dep) * 100) / 100;
};

export const normalizeAcceptedPets = (acceptedPets: any): {
  species: string[];
  maxCount: number;
  breedRestrictions: string[];
} => {
  if (!acceptedPets) {
    return { species: [], maxCount: 5, breedRestrictions: [] };
  }
  if (Array.isArray(acceptedPets)) {
    return { species: acceptedPets, maxCount: 5, breedRestrictions: [] };
  }
  return {
    species: acceptedPets.species || acceptedPets.acceptedSpecies || [],
    maxCount: acceptedPets.maxCount || acceptedPets.maxPets || 5,
    breedRestrictions: acceptedPets.breedRestrictions || acceptedPets.breedRestriction || [],
  };
};
