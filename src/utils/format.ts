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
