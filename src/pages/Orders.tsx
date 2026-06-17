import { useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Search,
  PackageSearch,
  ShoppingBag,
  ChevronRight,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  CircleDollarSign,
  Sparkles,
} from 'lucide-react';
import { useAppStore } from '@/store';
import type { Order, OrderStatus, Provider, Pet } from '@/types';
import Button from '@/components/common/Button';
import Input from '@/components/common/Input';
import OrderCard from '@/components/order/OrderCard';
import { getStatusLabel, getStatusColor } from '@/utils/format';
import { cn } from '@/lib/utils';

type OrderTabFilter =
  | 'all'
  | 'pending_confirm'
  | 'in_progress'
  | 'pending_balance'
  | 'completed'
  | 'cancelled';

const tabFilters: {
  value: OrderTabFilter;
  label: string;
  statuses?: OrderStatus[];
  icon: typeof Clock;
}[] = [
  { value: 'all', label: '全部', icon: ShoppingBag },
  {
    value: 'pending_confirm',
    label: '待确认',
    statuses: ['pending_confirm'],
    icon: Clock,
  },
  {
    value: 'in_progress',
    label: '进行中',
    statuses: ['confirmed', 'in_service'],
    icon: Sparkles,
  },
  {
    value: 'pending_balance',
    label: '待结款',
    statuses: ['pending_balance'],
    icon: CircleDollarSign,
  },
  {
    value: 'completed',
    label: '已完成',
    statuses: ['completed'],
    icon: CheckCircle2,
  },
  {
    value: 'cancelled',
    label: '已取消',
    statuses: ['cancelled'],
    icon: XCircle,
  },
];

export default function Orders() {
  const navigate = useNavigate();
  const orders = useAppStore((state) => state.orders);
  const providers = useAppStore((state) => state.providers);
  const pets = useAppStore((state) => state.pets);
  const currentUser = useAppStore((state) => state.currentUser);

  const [activeTab, setActiveTab] = useState<OrderTabFilter>('all');
  const [searchKeyword, setSearchKeyword] = useState('');

  const userOrders = useMemo(() => {
    if (!currentUser) return [];
    return orders.filter((o) => o.ownerId === currentUser.id);
  }, [orders, currentUser]);

  const providerMap = useMemo(() => {
    const map = new Map<string, Provider>();
    providers.forEach((p) => map.set(p.id, p));
    return map;
  }, [providers]);

  const petMap = useMemo(() => {
    const map = new Map<string, Pet>();
    pets.forEach((p) => map.set(p.id, p));
    return map;
  }, [pets]);

  const filteredOrders = useMemo(() => {
    let result = userOrders;

    if (activeTab !== 'all') {
      const tabConfig = tabFilters.find((t) => t.value === activeTab);
      if (tabConfig?.statuses) {
        result = result.filter((o) => tabConfig.statuses!.includes(o.status));
      }
    }

    if (searchKeyword.trim()) {
      const keyword = searchKeyword.trim().toLowerCase();
      result = result.filter((order) => {
        if (order.orderNo.toLowerCase().includes(keyword)) return true;
        const provider = providerMap.get(order.providerId);
        if (provider?.name.toLowerCase().includes(keyword)) return true;
        return false;
      });
    }

    return result.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [userOrders, activeTab, searchKeyword, providerMap]);

  const orderCounts = useMemo(() => {
    const counts: Record<OrderTabFilter, number> = {
      all: userOrders.length,
      pending_confirm: 0,
      in_progress: 0,
      pending_balance: 0,
      completed: 0,
      cancelled: 0,
    };

    userOrders.forEach((order) => {
      switch (order.status) {
        case 'pending_confirm':
          counts.pending_confirm++;
          break;
        case 'confirmed':
        case 'in_service':
          counts.in_progress++;
          break;
        case 'pending_balance':
          counts.pending_balance++;
          break;
        case 'completed':
          counts.completed++;
          break;
        case 'cancelled':
          counts.cancelled++;
          break;
      }
    });

    return counts;
  }, [userOrders]);

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md px-4">
          <div className="w-20 h-20 rounded-3xl bg-gray-100 flex items-center justify-center mx-auto mb-5">
            <AlertCircle className="w-10 h-10 text-gray-400" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            请先登录
          </h2>
          <p className="text-gray-500 mb-6">
            登录后即可查看您的订单记录
          </p>
          <Button onClick={() => navigate('/')} size="lg">
            返回首页
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            我的订单
          </h1>
          <p className="text-gray-500">
            共 {userOrders.length} 条订单记录
          </p>
        </div>

        <div className="bg-white rounded-3xl shadow-soft border border-gray-100 p-4 sm:p-5 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                value={searchKeyword}
                onChange={setSearchKeyword}
                placeholder="搜索订单号或商家名称"
                prefixIcon={<Search className="w-5 h-5" />}
              />
            </div>
          </div>

          <div className="mt-5 -mx-5 px-5 border-t border-gray-100 pt-5 overflow-x-auto">
            <div className="flex gap-2 min-w-max pb-1">
              {tabFilters.map((tab) => {
                const Icon = tab.icon;
                const count = orderCounts[tab.value];
                const isActive = activeTab === tab.value;
                return (
                  <button
                    key={tab.value}
                    onClick={() => setActiveTab(tab.value)}
                    className={cn(
                      'inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-medium transition-all duration-200',
                      isActive
                        ? 'bg-brand-500 text-white shadow-md'
                        : 'bg-gray-50 text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                    <span
                      className={cn(
                        'inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-xs font-semibold',
                        isActive
                          ? 'bg-white/20 text-white'
                          : 'bg-white text-gray-500 border border-gray-200'
                      )}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {filteredOrders.length === 0 ? (
          <div className="bg-white rounded-3xl shadow-soft border border-gray-100 p-10 sm:p-16 text-center">
            <div className="w-24 h-24 rounded-3xl bg-gray-50 flex items-center justify-center mx-auto mb-6">
              <PackageSearch className="w-12 h-12 text-gray-300" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              {searchKeyword.trim() ? '未找到匹配的订单' : '暂无订单'}
            </h3>
            <p className="text-gray-500 mb-8 max-w-sm mx-auto">
              {searchKeyword.trim()
                ? '请尝试其他关键词或调整筛选条件'
                : '快去挑选心仪的商家，为您的爱宠预约服务吧！'}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              {searchKeyword.trim() && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchKeyword('');
                    setActiveTab('all');
                  }}
                >
                  清除筛选
                </Button>
              )}
              <Button
                size="lg"
                onClick={() => navigate('/')}
                className="group"
              >
                去逛逛
                <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </Button>
            </div>

            {!searchKeyword.trim() && userOrders.length === 0 && (
              <div className="mt-10 pt-8 border-t border-gray-100">
                <p className="text-sm text-gray-400 mb-4">热门服务推荐</p>
                <div className="grid grid-cols-3 gap-3 max-w-md mx-auto">
                  {[
                    { label: '日间照料', emoji: '☀️' },
                    { label: '上门喂养', emoji: '🏠' },
                    { label: '住宿寄养', emoji: '🛏️' },
                  ].map((item) => (
                    <button
                      key={item.label}
                      onClick={() => navigate('/')}
                      className="p-4 rounded-2xl bg-gray-50 hover:bg-brand-50 border border-gray-100 hover:border-brand-200 transition-all duration-200 group"
                    >
                      <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">
                        {item.emoji}
                      </div>
                      <div className="text-sm font-medium text-gray-700 group-hover:text-brand-700">
                        {item.label}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <>
            {activeTab !== 'all' &&
              (() => {
                const statuses = tabFilters.find(
                  (t) => t.value === activeTab
                )?.statuses;
                if (!statuses || statuses.length === 0) return null;
                const pendingCount = filteredOrders.filter(
                  (o) => o.status === 'pending_confirm'
                ).length;
                if (pendingCount === 0) return null;
                return (
                  <div className="mb-6 rounded-2xl bg-amber-50 border border-amber-200 p-4 flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <div className="font-semibold text-amber-800">
                        您有 {pendingCount} 个订单待商家确认
                      </div>
                      <p className="text-sm text-amber-700 mt-1">
                        商家通常会在24小时内处理您的预约，如有疑问可联系商家客服。
                      </p>
                    </div>
                  </div>
                );
              })()}

            <div className="grid gap-4 sm:grid-cols-2">
              {filteredOrders.map((order) => {
                const provider = providerMap.get(order.providerId);
                const pet = petMap.get(order.petId);
                return (
                  <OrderCard
                    key={order.id}
                    order={order as any}
                    provider={provider as any}
                    pet={pet as any}
                  />
                );
              })}
            </div>

            {filteredOrders.length > 0 && (
              <div className="mt-8 flex items-center justify-between text-sm text-gray-500">
                <span>
                  显示 {filteredOrders.length} 条订单
                  {activeTab !== 'all' &&
                    `（${orderCounts[activeTab]} 条${
                      tabFilters.find((t) => t.value === activeTab)?.label
                    }订单）`}
                </span>
                <Link
                  to="/"
                  className="inline-flex items-center gap-1 text-brand-600 hover:text-brand-700 font-medium"
                >
                  继续预约服务
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
