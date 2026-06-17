import { useState, useMemo } from 'react';
import {
  TrendingUp,
  DollarSign,
  ShoppingBag,
  CalendarDays,
  Award,
  Download,
  Search,
  ChevronDown,
  Filter,
  PawPrint,
  FileText,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/store';
import ProviderSidebar from '@/components/layout/ProviderSidebar';
import IncomeChart, { type MonthlyIncome } from '@/components/dashboard/IncomeChart';
import StatsCard from '@/components/dashboard/StatsCard';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';
import Input from '@/components/common/Input';
import Empty from '@/components/Empty';
import { getServiceLabel, formatCurrency, getStatusColor, getStatusLabel } from '@/utils/format';
import { formatDate, formatDateTime } from '@/utils/date';
import type { Order } from '@/types';

export default function DashboardIncome() {
  const { orders, providers, pets, users, currentUser } = useAppStore();
  const [dateRange, setDateRange] = useState<'all' | 'month' | 'quarter' | 'year'>('year');
  const [searchQuery, setSearchQuery] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [showExportTip, setShowExportTip] = useState(false);

  const currentProvider = useMemo(() => {
    return providers.find((p) => p.userId === currentUser?.id) || providers[0];
  }, [providers, currentUser]);

  const today = new Date('2026-06-18');

  const monthlyData: MonthlyIncome[] = useMemo(() => {
    const months: { month: string; income: number; orders: number }[] = [];
    const monthNames = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];
    const baseAmounts = [8200, 12500, 9800, 15600, 18200, 14500, 16800, 19200, 13500, 17800, 21500, 18800];
    const orderCounts = [8, 12, 10, 15, 18, 14, 16, 19, 13, 17, 21, 18];
    for (let i = 0; i < 12; i++) {
      months.push({
        month: monthNames[i],
        income: baseAmounts[i] + Math.floor(Math.random() * 2000),
        orders: orderCounts[i] + Math.floor(Math.random() * 4),
      });
    }
    return months;
  }, []);

  const providerOrders = useMemo(() => {
    if (!currentProvider) return [] as Order[];
    return orders
      .filter((o) => o.providerId === currentProvider.id && o.status !== 'cancelled')
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [orders, currentProvider]);

  const stats = useMemo(() => {
    const totalIncome = monthlyData.reduce((s, d) => s + d.income, 0);
    const monthIncome = monthlyData[today.getMonth()]?.income || 0;
    const totalOrders = monthlyData.reduce((s, d) => s + d.orders, 0);
    const avgPrice = totalOrders > 0 ? totalIncome / totalOrders : 0;
    return { totalIncome, monthIncome, totalOrders, avgPrice };
  }, [monthlyData, today]);

  const filteredOrders = useMemo(() => {
    let result = [...providerOrders];

    if (startDate) {
      result = result.filter((o) => new Date(o.startDate) >= new Date(startDate));
    }
    if (endDate) {
      result = result.filter((o) => new Date(o.endDate) <= new Date(endDate));
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter((o) => {
        const pet = pets.find((p) => p.id === o.petId);
        const owner = users.find((u) => u.id === o.ownerId);
        return (
          pet?.name.toLowerCase().includes(query) ||
          owner?.name.toLowerCase().includes(query) ||
          o.id.toLowerCase().includes(query)
        );
      });
    }

    return result;
  }, [providerOrders, startDate, endDate, searchQuery, pets, users]);

  const tableIncome = useMemo(() => {
    return filteredOrders.reduce((s, o) => s + o.totalPrice, 0);
  }, [filteredOrders]);

  const handleExport = () => {
    setShowExportTip(true);
    setTimeout(() => setShowExportTip(false), 3000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream-50/30 via-white to-petal-50/20 flex">
      <ProviderSidebar />

      <main className="flex-1 min-w-0 p-6 md:p-8 overflow-auto">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-forest-100 to-green-100 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-forest-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">收入统计</h1>
                <p className="text-sm text-gray-500">查看寄养服务收入明细</p>
              </div>
            </div>

            <Button
              variant="outline"
              icon={<Download className="w-4 h-4" />}
              onClick={handleExport}
            >
              导出报表
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
            <StatsCard
              title="总收入"
              value={formatCurrency(stats.totalIncome)}
              icon={<DollarSign className="w-5 h-5" />}
              change="+15.3%"
              trend="up"
              color="brand"
            />
            <StatsCard
              title="本月收入"
              value={formatCurrency(stats.monthIncome)}
              icon={<CalendarDays className="w-5 h-5" />}
              change="+8.7%"
              trend="up"
              color="forest"
            />
            <StatsCard
              title="订单总数"
              value={stats.totalOrders}
              icon={<ShoppingBag className="w-5 h-5" />}
              change="+12%"
              trend="up"
              color="petal"
            />
            <StatsCard
              title="平均客单价"
              value={formatCurrency(stats.avgPrice)}
              icon={<Award className="w-5 h-5" />}
              change="+3.2%"
              trend="up"
              color="brand"
            />
          </div>

          <div className="mb-8">
            <IncomeChart data={monthlyData} />
          </div>

          <Card>
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center">
                  <FileText className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-gray-900">收入明细</h3>
                  <p className="text-xs text-gray-400 mt-0.5">
                    共 {filteredOrders.length} 条订单 · 合计 {formatCurrency(tableIncome)}
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex items-center gap-2">
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="h-11 px-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-200 focus:border-brand-300"
                  />
                  <span className="text-gray-400">~</span>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="h-11 px-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-200 focus:border-brand-300"
                  />
                </div>
                <div className="flex-1 max-w-xs">
                  <Input
                    value={searchQuery}
                    onChange={setSearchQuery}
                    placeholder="搜索订单号、宠物名..."
                    prefixIcon={<Search className="w-4 h-4" />}
                  />
                </div>
              </div>
            </div>

            <div className="overflow-x-auto -mx-6 px-6">
              <table className="w-full min-w-[800px]">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      订单信息
                    </th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      宠物
                    </th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      服务类型
                    </th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      日期
                    </th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      状态
                    </th>
                    <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      服务费
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12">
                        <Empty
                          title="暂无收入明细"
                          description="根据筛选条件没有找到订单"
                        />
                      </td>
                    </tr>
                  ) : (
                    filteredOrders.map((order, idx) => {
                      const pet = pets.find((p) => p.id === order.petId);
                      return (
                        <tr
                          key={order.id}
                          className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors animate-fade-in-up"
                          style={{ animationDelay: `${idx * 20}ms` }}
                        >
                          <td className="py-4 px-4">
                            <div className="text-sm font-semibold text-gray-900 font-mono">
                              {(order as any).orderNo || order.id}
                            </div>
                            <div className="text-xs text-gray-400 mt-0.5">
                              {formatDateTime(order.createdAt)}
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-2.5">
                              <div className="w-9 h-9 rounded-xl bg-petal-50 flex items-center justify-center shrink-0 overflow-hidden">
                                {(pet as any)?.avatar ? (
                                  <img
                                    src={(pet as any).avatar}
                                    alt={pet?.name}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <PawPrint className="w-4.5 h-4.5 text-pink-500" />
                                )}
                              </div>
                              <div>
                                <div className="text-sm font-medium text-gray-800">
                                  {pet?.name || '-'}
                                </div>
                                <div className="text-xs text-gray-400">
                                  {pet?.breed || '-'}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-forest-50 text-forest-700 text-xs font-medium">
                              {getServiceLabel(order.serviceType)}
                            </span>
                          </td>
                          <td className="py-4 px-4">
                            <div className="text-sm text-gray-700">
                              {formatDate(order.startDate)}
                            </div>
                            <div className="text-xs text-gray-400 mt-0.5">
                              ~ {formatDate(order.endDate)}
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <span
                              className={cn(
                                'inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border',
                                getStatusColor(order.status)
                              )}
                            >
                              {getStatusLabel(order.status)}
                            </span>
                          </td>
                          <td className="py-4 px-4 text-right">
                            <div className="text-sm font-bold text-gray-900">
                              {formatCurrency(order.totalPrice)}
                            </div>
                            <div className="text-xs text-gray-400 mt-0.5">
                              定金: {formatCurrency(order.deposit)}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {filteredOrders.length > 0 && (
              <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-50">
                <div className="text-sm text-gray-500">
                  显示 1 - {filteredOrders.length} 条，共 {filteredOrders.length} 条
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm">
                    上一页
                  </Button>
                  <div className="w-9 h-9 rounded-xl bg-brand-500 text-white flex items-center justify-center text-sm font-semibold">
                    1
                  </div>
                  <Button variant="ghost" size="sm">
                    下一页
                  </Button>
                </div>
              </div>
            )}
          </Card>

          {showExportTip && (
            <div className="fixed bottom-6 right-6 z-50 animate-fade-in-up">
              <div className="flex items-center gap-3 px-5 py-3.5 rounded-2xl bg-forest-500 text-white shadow-card">
                <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
                  <Download className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-sm font-semibold">报表导出成功</div>
                  <div className="text-xs text-white/80">已保存到下载目录</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
