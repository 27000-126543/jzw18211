import {
  Clock,
  CheckCircle2,
  Handshake,
  CarFront,
  CreditCard,
  CircleCheck,
  XCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { OrderStatus } from '@/types';
import { formatDateTime } from '@/utils/date';

interface OrderTimelineProps {
  status: OrderStatus;
  createdAt: string;
}

const STATUS_ORDER: OrderStatus[] = [
  'pending_confirm',
  'confirmed',
  'in_service',
  'pending_balance',
  'completed',
];

const STATUS_CONFIG: Record<
  OrderStatus,
  { label: string; icon: React.ComponentType<{ className?: string }> }
> = {
  pending_confirm: { label: '待确认', icon: Clock },
  confirmed: { label: '已确认', icon: Handshake },
  in_service: { label: '服务中', icon: CarFront },
  pending_balance: { label: '待结款', icon: CreditCard },
  completed: { label: '已完成', icon: CircleCheck },
  cancelled: { label: '已取消', icon: XCircle },
};

export default function OrderTimeline({ status, createdAt }: OrderTimelineProps) {
  const isCancelled = status === 'cancelled';

  const getStatusIndex = (s: OrderStatus): number => {
    if (s === 'cancelled') return -1;
    return STATUS_ORDER.indexOf(s);
  };

  const currentIndex = getStatusIndex(status);

  return (
    <div className="bg-white rounded-2xl shadow-soft border border-gray-100 p-6 animate-fade-in-up">
      <h3 className="text-base font-semibold text-gray-900 mb-6">订单状态</h3>

      <div className="relative">
        <div className="absolute left-[18px] top-6 bottom-6 w-0.5 bg-gray-100" />

        <div className="space-y-6">
          {STATUS_ORDER.map((s, index) => {
            const Icon = STATUS_CONFIG[s].icon;
            const isActive = isCancelled
              ? index <= getStatusIndex('pending_confirm')
              : index <= currentIndex;
            const isCurrent = s === status;

            return (
              <div key={s} className="relative flex items-start gap-4">
                <div
                  className={cn(
                    'relative z-10 w-9 h-9 rounded-full flex items-center justify-center shrink-0',
                    'border-2 transition-all duration-300',
                    isActive
                      ? 'bg-forest-500 border-forest-500 text-white shadow-lg shadow-forest-500/30'
                      : 'bg-white border-gray-200 text-gray-300'
                  )}
                >
                  <Icon className="w-4 h-4" />
                </div>

                <div className="flex-1 pt-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        'text-sm font-medium',
                        isActive ? 'text-gray-900' : 'text-gray-400'
                      )}
                    >
                      {STATUS_CONFIG[s].label}
                    </span>
                    {isCurrent && !isCancelled && (
                      <span className="px-2 py-0.5 bg-forest-50 text-forest-600 text-xs font-medium rounded-full">
                        当前
                      </span>
                    )}
                  </div>

                  <div
                    className={cn(
                      'text-xs mt-1',
                      isActive ? 'text-gray-500' : 'text-gray-300'
                    )}
                  >
                    {index === 0 ? formatDateTime(createdAt) : ''}
                  </div>
                </div>
              </div>
            );
          })}

          {isCancelled && (
            <div className="relative flex items-start gap-4">
              <div
                className={cn(
                  'relative z-10 w-9 h-9 rounded-full flex items-center justify-center shrink-0',
                  'border-2 bg-red-500 border-red-500 text-white shadow-lg shadow-red-500/30'
                )}
              >
                <XCircle className="w-4 h-4" />
              </div>

              <div className="flex-1 pt-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-red-600">已取消</span>
                  <span className="px-2 py-0.5 bg-red-50 text-red-600 text-xs font-medium rounded-full">
                    当前
                  </span>
                </div>
                <div className="text-xs mt-1 text-gray-500">订单已被取消</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
