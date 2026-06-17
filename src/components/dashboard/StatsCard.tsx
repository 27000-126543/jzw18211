import { TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

export type StatsColor = 'brand' | 'forest' | 'petal';
export type StatsTrend = 'up' | 'down';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  change?: string;
  trend?: StatsTrend;
  color?: StatsColor;
}

const COLOR_MAP: Record<StatsColor, string> = {
  brand: 'bg-brand-50 text-brand-600',
  forest: 'bg-forest-50 text-forest-600',
  petal: 'bg-petal-100 text-pink-600',
};

export default function StatsCard({
  title,
  value,
  icon,
  change,
  trend,
  color = 'brand',
}: StatsCardProps) {
  const TrendIcon = trend === 'up' ? TrendingUp : TrendingDown;
  const trendColor =
    trend === 'up' ? 'text-forest-600' : 'text-red-500';
  const trendBg =
    trend === 'up' ? 'bg-forest-50' : 'bg-red-50';

  return (
    <div
      className={cn(
        'bg-white rounded-2xl shadow-soft border border-gray-100 p-5',
        'hover:shadow-card hover:border-gray-200 transition-all duration-300',
        'animate-fade-in-up'
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-500 mb-2">{title}</p>
          <div className="text-2xl font-bold text-gray-900 tracking-tight">
            {value}
          </div>

          {change && (
            <div className="flex items-center gap-1.5 mt-3">
              <span
                className={cn(
                  'inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium',
                  trendBg,
                  trendColor
                )}
              >
                <TrendIcon className="w-3 h-3" />
                {change}
              </span>
              <span className="text-xs text-gray-400">较上周</span>
            </div>
          )}
        </div>

        <div
          className={cn(
            'w-12 h-12 rounded-xl flex items-center justify-center shrink-0',
            COLOR_MAP[color]
          )}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}
