import { Sun, Home, Bed } from 'lucide-react';
import type { Service, ServiceType } from '@/types';
import { formatCurrency, getServiceLabel } from '@/utils/format';
import { cn } from '@/lib/utils';

interface ServiceCardProps {
  service: Service;
  selected?: boolean;
  onSelect?: (service: Service) => void;
}

const iconMap: Record<ServiceType, typeof Sun> = {
  daycare: Sun,
  home_visit: Home,
  boarding: Bed,
};

export default function ServiceCard({ service, selected, onSelect }: ServiceCardProps) {
  const Icon = iconMap[service.type];

  return (
    <div
      onClick={() => onSelect?.(service)}
      className={cn(
        'relative cursor-pointer rounded-2xl p-4 transition-all duration-200 border-2',
        selected
          ? 'border-brand-500 bg-brand-50 shadow-float'
          : 'border-gray-100 bg-white hover:border-gray-200 hover:shadow-soft'
      )}
    >
      <div className="flex items-start gap-4">
        <div
          className={cn(
            'flex h-12 w-12 shrink-0 items-center justify-center rounded-xl',
            selected ? 'bg-brand-500 text-white' : 'bg-gray-100 text-gray-600'
          )}
        >
          <Icon className="h-6 w-6" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <h4 className="font-semibold text-gray-900">{getServiceLabel(service.type)}</h4>
            <div className="shrink-0 text-right">
              <span className="text-lg font-bold text-brand-600">
                {formatCurrency(service.pricePerDay)}
              </span>
              <span className="text-xs text-gray-400">/天</span>
            </div>
          </div>

          <p className="mt-1 line-clamp-2 text-sm text-gray-500">{service.description}</p>

          {service.minDays && service.minDays > 1 && (
            <p className="mt-2 text-xs text-amber-600">最少预约 {service.minDays} 天</p>
          )}

          <div className="mt-3 flex flex-wrap gap-1.5">
            {service.includedItems.slice(0, 4).map((item, idx) => (
              <span
                key={idx}
                className={cn(
                  'rounded-md px-2 py-0.5 text-xs',
                  selected ? 'bg-brand-100 text-brand-700' : 'bg-gray-100 text-gray-500'
                )}
              >
                {item}
              </span>
            ))}
            {service.includedItems.length > 4 && (
              <span className="rounded-md bg-gray-100 px-2 py-0.5 text-xs text-gray-400">
                +{service.includedItems.length - 4}
              </span>
            )}
          </div>
        </div>
      </div>

      {selected && (
        <div className="absolute right-3 top-3 h-5 w-5 rounded-full bg-brand-500 flex items-center justify-center">
          <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
      )}
    </div>
  );
}
