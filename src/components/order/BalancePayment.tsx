import { useState } from 'react';
import {
  CreditCard,
  Loader2,
  CheckCircle2,
  Wallet,
  Banknote,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Order } from '@/types';
import { formatCurrency, getOrderTotal, getOrderDeposit, getOrderBalance } from '@/utils/format';

interface BalancePaymentProps {
  order: Order;
  onPay?: () => void;
}

type PaymentMethod = 'wechat' | 'alipay' | 'bank';

const WechatIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor">
    <path d="M8.691 2.188C3.891 2.188 0 5.476 0 9.53c0 2.212 1.17 4.203 3.002 5.55a.59.59 0 0 1 .213.665l-.39 1.48c-.019.07-.048.141-.048.213 0 .163.13.295.29.295a.326.326 0 0 0 .167-.054l1.903-1.114a.864.864 0 0 1 .717-.098 10.16 10.16 0 0 0 2.837.403c.276 0 .543-.027.811-.05-.857-2.578.157-4.972 1.932-6.446 1.703-1.415 3.882-1.98 5.853-1.838-.576-3.583-4.196-6.348-8.596-6.348zM5.785 5.991c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 0 1-1.162 1.178A1.17 1.17 0 0 1 4.623 7.17c0-.651.52-1.18 1.162-1.18zm5.813 0c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 0 1-1.162 1.178 1.17 1.17 0 0 1-1.162-1.178c0-.651.52-1.18 1.162-1.18zm5.34 2.867c-1.797-.052-3.746.512-5.28 1.786-1.72 1.428-2.687 3.72-1.78 6.22.942 2.453 3.666 4.229 6.884 4.229.826 0 1.622-.12 2.361-.336a.722.722 0 0 1 .598.082l1.584.926a.272.272 0 0 0 .14.047c.134 0 .24-.111.24-.247 0-.06-.023-.12-.038-.177l-.327-1.233a.582.582 0 0 1-.023-.156.49.49 0 0 1 .201-.398C23.024 18.48 24 16.82 24 14.98c0-3.21-2.931-5.837-6.656-6.088V8.89c-.135-.01-.267-.03-.407-.032zm-2.53 3.274c.535 0 .969.44.969.982a.976.976 0 0 1-.969.983.976.976 0 0 1-.969-.983c0-.542.434-.982.97-.982zm4.844 0c.535 0 .969.44.969.982a.976.976 0 0 1-.969.983.976.976 0 0 1-.969-.983c0-.542.434-.982.969-.982z" />
  </svg>
);

const PAYMENT_METHODS: {
  id: PaymentMethod;
  name: string;
  desc: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}[] = [
  {
    id: 'wechat',
    name: '微信支付',
    desc: '推荐使用，方便快捷',
    icon: WechatIcon,
    color: 'text-green-500',
  },
  {
    id: 'alipay',
    name: '支付宝',
    desc: '支持花呗分期',
    icon: Wallet,
    color: 'text-blue-500',
  },
  {
    id: 'bank',
    name: '银行卡',
    desc: '储蓄卡/信用卡支付',
    icon: Banknote,
    color: 'text-purple-500',
  },
];

export default function BalancePayment({ order, onPay }: BalancePaymentProps) {
  const [method, setMethod] = useState<PaymentMethod>('wechat');
  const [loading, setLoading] = useState(false);
  const [paid, setPaid] = useState(false);

  const total = getOrderTotal(order);
  const deposit = getOrderDeposit(order);
  const balance = getOrderBalance(order);

  const handlePay = async () => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1500));
    setLoading(false);
    setPaid(true);
    onPay?.();
  };

  if (paid) {
    return (
      <div className="bg-white rounded-2xl shadow-soft border border-gray-100 p-8 text-center animate-fade-in-up">
        <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-forest-50 flex items-center justify-center animate-bounce-soft">
          <CheckCircle2 className="w-12 h-12 text-forest-500" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">支付成功</h3>
        <p className="text-sm text-gray-500 mb-6">
          尾款 {formatCurrency(balance)} 已支付完成
        </p>
        <div className="bg-forest-50 rounded-xl p-4 max-w-xs mx-auto">
          <div className="text-xs text-gray-500 mb-1">订单号</div>
          <div className="text-sm font-mono text-gray-800">{order.orderNo}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-soft border border-gray-100 p-6 animate-fade-in-up">
      <h3 className="text-base font-semibold text-gray-900 mb-6">尾款结算</h3>

      <div className="bg-gradient-to-br from-cream-50 to-cream-100 rounded-xl p-5 mb-6">
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">订单总价</span>
            <span className="text-gray-900 font-medium">
              {formatCurrency(total)}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">已付定金</span>
            <span className="text-forest-600 font-medium">
              - {formatCurrency(deposit)}
            </span>
          </div>
          <div className="h-px bg-brand-200/60" />
          <div className="flex items-center justify-between">
            <span className="text-gray-800 font-medium">应付尾款</span>
            <span className="text-2xl font-bold text-brand-600">
              {formatCurrency(balance)}
            </span>
          </div>
        </div>
      </div>

      <div className="mb-6">
        <div className="text-sm font-medium text-gray-700 mb-3">选择支付方式</div>
        <div className="space-y-2.5">
          {PAYMENT_METHODS.map((m) => {
            const Icon = m.icon;
            const isSelected = method === m.id;
            return (
              <button
                key={m.id}
                onClick={() => setMethod(m.id)}
                className={cn(
                  'w-full flex items-center gap-4 p-4 rounded-xl border transition-all duration-200',
                  'text-left group',
                  isSelected
                    ? 'border-brand-300 bg-brand-50/70 shadow-sm'
                    : 'border-gray-100 bg-gray-50/50 hover:border-gray-200 hover:bg-white'
                )}
              >
                <div
                  className={cn(
                    'w-10 h-10 rounded-xl flex items-center justify-center shrink-0',
                    isSelected
                      ? 'bg-white shadow-sm'
                      : 'bg-white group-hover:shadow-sm'
                  )}
                >
                  <Icon className={cn('w-6 h-6', m.color)} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-900">{m.name}</div>
                  <div className="text-xs text-gray-400 mt-0.5">{m.desc}</div>
                </div>
                <div
                  className={cn(
                    'w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all',
                    isSelected
                      ? 'border-brand-500 bg-brand-500'
                      : 'border-gray-300'
                  )}
                >
                  {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <button
        onClick={handlePay}
        disabled={loading}
        className={cn(
          'w-full flex items-center justify-center gap-2 py-3.5 rounded-xl',
          'bg-brand-500 text-white text-base font-semibold',
          'hover:bg-brand-600 active:bg-brand-700 transition-colors',
          'shadow-float disabled:opacity-70 disabled:cursor-not-allowed'
        )}
      >
        {loading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>支付中...</span>
          </>
        ) : (
          <>
            <CreditCard className="w-5 h-5" />
            <span>立即支付 {formatCurrency(balance)}</span>
          </>
        )}
      </button>

      <p className="text-xs text-gray-400 text-center mt-4">
        支付即表示同意《寄养服务协议》
      </p>
    </div>
  );
}
