import type { ServiceType } from '@/types';
import { formatCurrency, getServiceLabel } from '@/utils/format';
import { cn } from '@/lib/utils';

interface PriceBreakdownProps {
  dailyPrice: number;
  daysCount: number;
  serviceLabel?: string;
  serviceType?: ServiceType;
}

export default function PriceBreakdown({
  dailyPrice,
  daysCount,
  serviceLabel,
  serviceType,
}: PriceBreakdownProps) {
  const label = serviceLabel || (serviceType ? getServiceLabel(serviceType) : '服务');

  const serviceTotal = dailyPrice * daysCount;
  const platformFee = Math.round(serviceTotal * 0.05 * 100) / 100;
  const totalAmount = serviceTotal + platformFee;
  const deposit = Math.round(totalAmount * 0.3 * 100) / 100;
  const balance = Math.round((totalAmount - deposit) * 100) / 100;

  const Row = ({
    name,
    value,
    muted = false,
    highlight = false,
  }: {
    name: string;
    value: string;
    muted?: boolean;
    highlight?: boolean;
  }) => (
    <div className="flex items-center justify-between py-2">
      <span
        className={cn(
          'text-sm',
          muted && 'text-gray-500',
          !muted && !highlight && 'text-gray-700',
          highlight && 'text-gray-900 font-semibold'
        )}
      >
        {name}
      </span>
      <span
        className={cn(
          'text-sm tabular-nums',
          muted && 'text-gray-500',
          !muted && !highlight && 'text-gray-900',
          highlight && 'text-xl font-bold text-brand-600'
        )}
      >
        {value}
      </span>
    </div>
  );

  return (
    <div className="rounded-3xl bg-white p-5 shadow-soft border border-gray-100">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">费用明细</h3>

      <div className="space-y-1">
        <Row
          name={`${label} · ${formatCurrency(dailyPrice)} × ${daysCount}天`}
          value={formatCurrency(serviceTotal)}
        />
        <Row name="平台服务费 (5%)" value={formatCurrency(platformFee)} muted />
      </div>

      <div className="my-4 border-t border-dashed border-gray-200" />

      <Row name="应付总额" value={formatCurrency(totalAmount)} highlight />

      <div className="mt-5 rounded-2xl bg-gradient-to-br from-brand-50 to-petal-50 p-4 border border-brand-100">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <div className="text-xs text-gray-500">定金 30%</div>
            <div className="text-lg font-bold text-brand-600">{formatCurrency(deposit)}</div>
          </div>
          <div className="h-10 w-px bg-brand-200" />
          <div className="space-y-0.5 text-right">
            <div className="text-xs text-gray-500">尾款 70%</div>
            <div className="text-lg font-bold text-gray-700">{formatCurrency(balance)}</div>
          </div>
        </div>
        <p className="mt-3 pt-3 border-t border-brand-100 text-xs text-gray-500 leading-relaxed">
          下单时支付定金，确认服务后支付尾款。提前取消可按规则退款。
        </p>
      </div>
    </div>
  );
}
