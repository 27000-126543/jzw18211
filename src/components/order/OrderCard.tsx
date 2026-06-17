import { useNavigate } from 'react-router-dom';
import { CalendarDays, Building2, PawPrint, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Order, Provider, Pet } from '@/types';
import { getStatusColor, getStatusLabel, getServiceLabel, formatCurrency } from '@/utils/format';
import { formatDate } from '@/utils/date';

interface OrderCardProps {
  order: Order;
  provider?: Provider;
  pet?: Pet;
}

export default function OrderCard({ order, provider, pet }: OrderCardProps) {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/orders/${order.id}`);
  };

  return (
    <div
      className={cn(
        'bg-white rounded-2xl shadow-soft border border-gray-100',
        'p-5 hover:shadow-card hover:border-brand-200 transition-all duration-300 cursor-pointer',
        'animate-fade-in-up'
      )}
      onClick={handleClick}
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <span className="text-xs text-gray-400 font-mono tracking-wide">
            订单号 {order.orderNo}
          </span>
          <div className="mt-1.5">
            <span
              className={cn(
                'inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border',
                getStatusColor(order.status)
              )}
            >
              {getStatusLabel(order.status)}
            </span>
          </div>
        </div>
        <div className="text-right">
          <div className="text-lg font-bold text-gray-900">
            {formatCurrency(order.totalAmount)}
          </div>
          <div className="text-xs text-gray-400 mt-0.5">总金额</div>
        </div>
      </div>

      <div className="space-y-3">
        {provider && (
          <div className="flex items-center gap-2.5 text-sm text-gray-600">
            <Building2 className="w-4 h-4 text-brand-500 shrink-0" />
            <span className="truncate">{provider.name}</span>
          </div>
        )}

        <div className="flex items-center gap-2.5 text-sm text-gray-600">
          <PawPrint className="w-4 h-4 text-forest-500 shrink-0" />
          <span className="bg-cream-100 text-forest-700 px-2 py-0.5 rounded-md text-xs font-medium">
            {getServiceLabel(order.serviceType)}
          </span>
        </div>

        <div className="flex items-center gap-2.5 text-sm text-gray-600">
          <CalendarDays className="w-4 h-4 text-brand-500 shrink-0" />
          <span>
            {formatDate(order.startDate)} ~ {formatDate(order.endDate)}
          </span>
        </div>

        {pet && (
          <div className="flex items-center gap-2.5 text-sm pt-2 border-t border-gray-50">
            <div className="w-8 h-8 rounded-full bg-petal-100 flex items-center justify-center shrink-0">
              <PawPrint className="w-4 h-4 text-brand-600" />
            </div>
            <div>
              <div className="text-gray-800 font-medium">{pet.name}</div>
              <div className="text-xs text-gray-400">{pet.breed}</div>
            </div>
          </div>
        )}
      </div>

      <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
        <span className="text-sm text-gray-500">点击查看订单详情</span>
        <button
          className={cn(
            'flex items-center gap-1 px-4 py-2 rounded-xl',
            'bg-brand-500 text-white text-sm font-medium',
            'hover:bg-brand-600 active:bg-brand-700 transition-colors',
            'shadow-sm hover:shadow-float'
          )}
          onClick={(e) => {
            e.stopPropagation();
            handleClick();
          }}
        >
          查看详情
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
