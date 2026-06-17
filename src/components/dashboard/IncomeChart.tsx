import { useState, useMemo } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { TrendingUp, ShoppingBag, DollarSign, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatCurrency } from '@/utils/format';

export interface MonthlyIncome {
  month: string;
  income: number;
  orders: number;
}

interface IncomeChartProps {
  data: MonthlyIncome[];
}

type TimeRange = 'month' | 'quarter' | 'year';

const TIME_RANGES: { id: TimeRange; label: string }[] = [
  { id: 'month', label: '本月' },
  { id: 'quarter', label: '本季' },
  { id: 'year', label: '本年' },
];

export default function IncomeChart({ data: initialData }: IncomeChartProps) {
  const [range, setRange] = useState<TimeRange>('year');

  const data = useMemo(() => {
    const counts = { month: 6, quarter: 9, year: 12 };
    return initialData.slice(-counts[range]);
  }, [initialData, range]);

  const stats = useMemo(() => {
    const latest = data[data.length - 1];
    const totalIncome = data.reduce((sum, d) => sum + d.income, 0);
    const totalOrders = data.reduce((sum, d) => sum + d.orders, 0);
    const avgOrder = totalOrders > 0 ? totalIncome / totalOrders : 0;

    return {
      monthIncome: latest?.income || 0,
      monthOrders: latest?.orders || 0,
      avgOrder,
    };
  }, [data]);

  return (
    <div className="bg-white rounded-2xl shadow-soft border border-gray-100 p-6 animate-fade-in-up">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-forest-50 flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-forest-500" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-gray-900">收入统计</h3>
            <p className="text-xs text-gray-400 mt-0.5">寄养服务收入趋势</p>
          </div>
        </div>

        <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
          {TIME_RANGES.map((r) => (
            <button
              key={r.id}
              onClick={() => setRange(r.id)}
              className={cn(
                'px-3 py-1.5 rounded-md text-xs font-medium transition-all',
                range === r.id
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              )}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      <div className="h-56 mb-6">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
          >
            <defs>
              <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#FF8C42" stopOpacity={0.35} />
                <stop offset="100%" stopColor="#FF8C42" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="#f3f4f6"
            />
            <XAxis
              dataKey="month"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: '#9ca3af' }}
              dy={10}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: '#9ca3af' }}
              tickFormatter={(v) => '¥' + (v >= 1000 ? (v / 1000).toFixed(0) + 'k' : v)}
              width={50}
            />
            <Tooltip
              contentStyle={{
                background: '#fff',
                borderRadius: '12px',
                border: '1px solid #f3f4f6',
                boxShadow: '0 8px 32px -12px rgba(0,0,0,0.12)',
                padding: '12px 14px',
              }}
              labelStyle={{
                fontWeight: 600,
                marginBottom: '6px',
                color: '#111827',
              }}
              itemStyle={{ fontSize: '12px' }}
              formatter={(value: number, name: string) => [
                name === 'income'
                  ? formatCurrency(value)
                  : value + ' 单',
                name === 'income' ? '收入' : '订单数',
              ]}
            />
            <Area
              type="monotone"
              dataKey="income"
              stroke="#FF8C42"
              strokeWidth={2.5}
              fill="url(#incomeGradient)"
              dot={{
                fill: '#fff',
                stroke: '#FF8C42',
                strokeWidth: 2,
                r: 4,
              }}
              activeDot={{
                r: 6,
                fill: '#FF8C42',
                stroke: '#fff',
                strokeWidth: 2,
              }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="bg-gradient-to-br from-brand-50 to-cream-100 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-white/80 flex items-center justify-center">
              <DollarSign className="w-4 h-4 text-brand-600" />
            </div>
            <span className="text-xs font-medium text-brand-700">本月收入</span>
          </div>
          <div className="text-xl font-bold text-gray-900">
            {formatCurrency(stats.monthIncome)}
          </div>
        </div>

        <div className="bg-gradient-to-br from-forest-50 to-forest-100/40 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-white/80 flex items-center justify-center">
              <ShoppingBag className="w-4 h-4 text-forest-600" />
            </div>
            <span className="text-xs font-medium text-forest-700">订单数</span>
          </div>
          <div className="text-xl font-bold text-gray-900">
            {stats.monthOrders}
            <span className="text-sm font-normal text-gray-500 ml-1">单</span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-petal-50 to-petal-100/60 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-white/80 flex items-center justify-center">
              <Calendar className="w-4 h-4 text-pink-600" />
            </div>
            <span className="text-xs font-medium text-pink-700">
              平均客单价
            </span>
          </div>
          <div className="text-xl font-bold text-gray-900">
            {formatCurrency(stats.avgOrder)}
          </div>
        </div>
      </div>
    </div>
  );
}
