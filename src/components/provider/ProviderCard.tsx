import { Star, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { Provider } from '@/types';
import { formatCurrency, getServiceLabel } from '@/utils/format';
import { cn } from '@/lib/utils';

interface ProviderCardProps {
  provider: Provider;
}

export default function ProviderCard({ provider }: ProviderCardProps) {
  const navigate = useNavigate();
  const minPrice = Math.min(...provider.services.map((s) => s.pricePerDay));
  const serviceChips = provider.services.slice(0, 3);

  const handleClick = () => {
    navigate(`/provider/${provider.id}`);
  };

  return (
    <div
      onClick={handleClick}
      className={cn(
        'group cursor-pointer overflow-hidden rounded-3xl bg-white transition-all duration-300',
        'shadow-soft hover:shadow-card hover:-translate-y-1',
        'border border-gray-100'
      )}
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={provider.photos[0]?.url}
          alt={provider.businessName}
          className={cn(
            'h-full w-full object-cover transition-transform duration-500',
            'group-hover:scale-105'
          )}
        />
        {provider.certified && (
          <div className="absolute left-3 top-3 rounded-full bg-brand-500 px-3 py-1 text-xs font-medium text-white shadow-md">
            已认证
          </div>
        )}
      </div>

      <div className="space-y-3 p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="line-clamp-1 text-lg font-semibold text-gray-900 group-hover:text-brand-600">
            {provider.businessName}
          </h3>
          <div className="flex shrink-0 items-center gap-1">
            <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
            <span className="text-sm font-semibold text-gray-900">{provider.rating}</span>
            <span className="text-xs text-gray-400">({provider.reviewCount})</span>
          </div>
        </div>

        <div className="flex items-start gap-1.5">
          <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />
          <span className="line-clamp-1 text-sm text-gray-500">{provider.address}</span>
        </div>

        <div className="flex flex-wrap gap-2">
          {serviceChips.map((service) => (
            <span
              key={service.id}
              className={cn(
                'rounded-full px-2.5 py-1 text-xs font-medium',
                service.type === 'daycare' && 'bg-sky-50 text-sky-600',
                service.type === 'home_visit' && 'bg-violet-50 text-violet-600',
                service.type === 'boarding' && 'bg-forest-50 text-forest-600'
              )}
            >
              {getServiceLabel(service.type)}
            </span>
          ))}
        </div>

        <div className="flex items-center justify-between border-t border-gray-100 pt-3">
          <div className="flex items-baseline gap-1">
            <span className="text-xs text-gray-400">from</span>
            <span className="text-xl font-bold text-brand-600">{formatCurrency(minPrice)}</span>
            <span className="text-xs text-gray-400">/天</span>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleClick();
            }}
            className={cn(
              'rounded-full bg-brand-500 px-4 py-2 text-sm font-medium text-white',
              'transition-all duration-200 hover:bg-brand-600 active:scale-95'
            )}
          >
            查看详情
          </button>
        </div>
      </div>
    </div>
  );
}
