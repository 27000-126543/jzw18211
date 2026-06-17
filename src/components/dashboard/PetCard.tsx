import {
  PawPrint,
  CalendarDays,
  AlertCircle,
  CheckCircle2,
  XCircle,
  ChevronRight,
  Tag,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Pet, Order } from '@/types';
import { getServiceLabel } from '@/utils/format';
import { formatDate } from '@/utils/date';

interface PetCardProps {
  pet: Pet;
  order: Order;
  onViewDetail?: () => void;
}

export default function PetCard({ pet, order, onViewDetail }: PetCardProps) {
  const hasVaccines = pet.vaccineRecords && pet.vaccineRecords.length > 0;

  return (
    <div
      className={cn(
        'bg-white rounded-2xl shadow-soft border border-gray-100 overflow-hidden',
        'hover:shadow-card hover:border-brand-200 transition-all duration-300 cursor-pointer',
        'animate-fade-in-up'
      )}
      onClick={onViewDetail}
    >
      <div className="relative bg-gradient-to-br from-petal-100 via-cream-100 to-brand-50 p-5 pb-6">
        <div className="flex items-start gap-4">
          <div className="relative w-16 h-16 rounded-2xl bg-white shadow-sm flex items-center justify-center shrink-0 overflow-hidden">
            <PawPrint className="w-8 h-8 text-brand-400" />
            <div className="absolute bottom-0 right-0 w-5 h-5 rounded-full bg-white flex items-center justify-center">
              <div
                className={cn(
                  'w-3 h-3 rounded-full',
                  hasVaccines ? 'bg-forest-500' : 'bg-red-400'
                )}
              />
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <h4 className="text-lg font-bold text-gray-900 truncate">
                  {pet.name}
                </h4>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-sm text-gray-600">{pet.breed}</span>
                  <span className="w-1 h-1 rounded-full bg-gray-300" />
                  <span className="text-sm text-gray-600">{pet.age}岁</span>
                </div>
              </div>

              <div
                className={cn(
                  'flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium shrink-0',
                  hasVaccines
                    ? 'bg-forest-50 text-forest-700'
                    : 'bg-red-50 text-red-600'
                )}
              >
                {hasVaccines ? (
                  <>
                    <CheckCircle2 className="w-3 h-3" />
                    已打疫苗
                  </>
                ) : (
                  <>
                    <XCircle className="w-3 h-3" />
                    缺疫苗
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="p-5 pt-4 space-y-4">
        {pet.notes && (
          <div>
            <div className="flex items-center gap-1.5 text-xs font-medium text-gray-500 mb-2">
              <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
              注意事项
            </div>
            <div className="flex flex-wrap gap-1.5">
              {pet.notes.split(/[，,、。.\s]+/).filter(Boolean).slice(0, 3).map((note, idx) => (
                <span
                  key={idx}
                  className={cn(
                    'inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs',
                    'bg-amber-50 text-amber-700 border border-amber-100'
                  )}
                >
                  <Tag className="w-3 h-3" />
                  {note}
                </span>
              ))}
              {pet.notes.length > 20 && (
                <span className="inline-flex items-center px-2 py-1 rounded-md text-xs bg-gray-50 text-gray-500">
                  ...
                </span>
              )}
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3 pt-2 border-t border-gray-50">
          <div>
            <div className="text-xs text-gray-400 mb-1">服务类型</div>
            <div className="text-sm font-medium text-gray-800">
              {getServiceLabel(order.serviceType)}
            </div>
          </div>
          <div>
            <div className="text-xs text-gray-400 mb-1">时段</div>
            <div className="text-sm font-medium text-gray-800">
              {order.timeSlot}
            </div>
          </div>
        </div>

        <div
          className={cn(
            'flex items-center gap-2 px-3 py-2.5 rounded-xl',
            'bg-gradient-to-r from-brand-50 to-cream-50 border border-brand-100/50'
          )}
        >
          <CalendarDays className="w-4 h-4 text-brand-500 shrink-0" />
          <div className="flex-1 min-w-0">
            <div className="text-xs text-gray-500">寄养日期</div>
            <div className="text-sm font-medium text-gray-800 truncate">
              {formatDate(order.startDate)} ~ {formatDate(order.endDate)}
            </div>
          </div>
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onViewDetail?.();
          }}
          className={cn(
            'w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl',
            'bg-gray-50 text-gray-700 text-sm font-medium',
            'hover:bg-brand-50 hover:text-brand-600 transition-colors',
            'group'
          )}
        >
          查看详情
          <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
        </button>
      </div>
    </div>
  );
}
