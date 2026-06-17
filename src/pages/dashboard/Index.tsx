import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CalendarDays,
  DollarSign,
  PawPrint,
  MessageSquare,
  CheckCircle2,
  ImagePlus,
  ChevronRight,
  Bell,
  TrendingUp,
  Sun,
  Calendar,
  Star,
  AlertCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/store';
import ProviderSidebar from '@/components/layout/ProviderSidebar';
import StatsCard from '@/components/dashboard/StatsCard';
import PetCard from '@/components/dashboard/PetCard';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';
import Avatar from '@/components/common/Avatar';
import Empty from '@/components/Empty';
import { formatCurrency } from '@/utils/format';
import { formatDate, isSameDay, addDays } from '@/utils/date';
import type { Order } from '@/types';

export default function DashboardIndex() {
  const navigate = useNavigate();
  const { orders, providers, pets, users, reviews, currentUser, updateOrderStatus } = useAppStore();
  const [showPetModal, setShowPetModal] = useState<{ order: Order; pet: any } | null>(null);

  const currentProvider = useMemo(() => {
    return providers.find((p) => p.userId === currentUser?.id) || providers[0];
  }, [providers, currentUser]);

  const today = new Date('2026-06-18');

  const providerOrders = useMemo(() => {
    if (!currentProvider) return [] as Order[];
    return orders.filter((o) => o.providerId === currentProvider.id);
  }, [orders, currentProvider]);

  const todayAppointments = useMemo(() => {
    return providerOrders.filter((o) => isSameDay(o.startDate, today));
  }, [providerOrders, today]);

  const pendingConfirmOrders = useMemo(() => {
    return providerOrders.filter((o) => o.status === 'pending_confirm');
  }, [providerOrders]);

  const inServicePets = useMemo(() => {
    return providerOrders.filter((o) => o.status === 'in_service');
  }, [providerOrders]);

  const pendingReviews = useMemo(() => {
    const completedOrders = providerOrders.filter((o) => o.status === 'completed');
    return completedOrders.filter(
      (o) => !reviews.some((r) => r.orderId === o.id)
    ).length;
  }, [providerOrders, reviews]);

  const todayIncome = useMemo(() => {
    return providerOrders
      .filter((o) => isSameDay(o.createdAt, today) && o.status !== 'cancelled')
      .reduce((sum, o) => sum + o.deposit, 0);
  }, [providerOrders, today]);

  const monthIncome = useMemo(() => {
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    return providerOrders
      .filter((o) => {
        const createdAt = new Date(o.createdAt);
        return createdAt >= monthStart && o.status !== 'cancelled';
      })
      .reduce((sum, o) => sum + o.totalPrice, 0);
  }, [providerOrders, today]);

  const upcomingPets = useMemo(() => {
    const nextWeek = addDays(today, 7);
    return providerOrders
      .filter((o) => {
        const startDate = new Date(o.startDate);
        return startDate >= today && startDate <= nextWeek && ['confirmed', 'pending_confirm'].includes(o.status);
      })
      .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
  }, [providerOrders, today]);

  const weeklyTrend = useMemo(() => {
    const data: { day: string; orders: number; income: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const date = addDays(today, -i);
      const dayOrders = providerOrders.filter((o) => isSameDay(o.createdAt, date));
      data.push({
        day: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'][date.getDay() === 0 ? 6 : date.getDay() - 1],
        orders: dayOrders.length,
        income: dayOrders.reduce((s, o) => s + o.totalPrice, 0),
      });
    }
    return data;
  }, [providerOrders, today]);

  const maxOrders = Math.max(...weeklyTrend.map((d) => d.orders), 1);

  const handleConfirmOrder = (orderId: string) => {
    updateOrderStatus(orderId, 'confirmed');
  };

  const getPetForOrder = (order: Order) => {
    return pets.find((p) => p.id === order.petId);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream-50/30 via-white to-petal-50/20 flex">
      <ProviderSidebar />

      <main className="flex-1 min-w-0 p-6 md:p-8 overflow-auto">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-brand-100 to-petal-100 flex items-center justify-center">
                  <Sun className="w-6 h-6 text-brand-500" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    早上好，{currentProvider?.businessName || '商家'}！
                  </h1>
                  <p className="text-sm text-gray-500">
                    {formatDate(today, 'yyyy年M月d日 EEEE')} · 今天有 {todayAppointments.length} 个预约
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button className="w-11 h-11 rounded-xl bg-white border border-gray-100 flex items-center justify-center text-gray-500 hover:text-brand-500 hover:bg-brand-50 transition-all relative">
                <Bell className="w-5 h-5" />
                {pendingConfirmOrders.length > 0 && (
                  <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-red-500" />
                )}
              </button>
              <Avatar
                size="lg"
                src={(currentUser as any)?.avatar}
                name={currentUser?.name || ''}
                className="border-2 border-white shadow-soft"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
            <StatsCard
              title="今日预约数"
              value={todayAppointments.length}
              icon={<CalendarDays className="w-5 h-5" />}
              change="+12%"
              trend="up"
              color="brand"
            />
            <StatsCard
              title="本月收入"
              value={formatCurrency(monthIncome)}
              icon={<DollarSign className="w-5 h-5" />}
              change="+8.5%"
              trend="up"
              color="forest"
            />
            <StatsCard
              title="服务中宠物"
              value={inServicePets.length}
              icon={<PawPrint className="w-5 h-5" />}
              change="+2"
              trend="up"
              color="petal"
            />
            <StatsCard
              title="待处理评价"
              value={pendingReviews}
              icon={<MessageSquare className="w-5 h-5" />}
              change="-3"
              trend="up"
              color="brand"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <Card hover className="lg:col-span-2 animate-fade-in-up">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-brand-500" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-gray-900">近期订单趋势</h3>
                    <p className="text-xs text-gray-400 mt-0.5">近7天订单数量变化</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-xs">
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-gradient-to-br from-brand-400 to-brand-500" />
                    <span className="text-gray-500">订单数</span>
                  </div>
                </div>
              </div>

              <div className="h-56 flex items-end gap-3 px-2">
                {weeklyTrend.map((data, idx) => {
                  const height = maxOrders > 0 ? (data.orders / maxOrders) * 100 : 0;
                  const isToday = idx === weeklyTrend.length - 1;
                  return (
                    <div key={idx} className="flex-1 flex flex-col items-center gap-2">
                      <div className="w-full relative flex justify-center">
                        <div
                          className={cn(
                            'w-full max-w-[48px] rounded-t-xl transition-all duration-500 relative group cursor-pointer',
                            isToday
                              ? 'bg-gradient-to-t from-brand-500 to-brand-400 shadow-md shadow-brand-500/30'
                              : 'bg-gradient-to-t from-brand-200 to-brand-100 hover:from-brand-300 hover:to-brand-200'
                          )}
                          style={{ height: `${Math.max(height, 8)}%`, minHeight: '20px' }}
                        >
                          {data.orders > 0 && (
                            <div className="absolute -top-7 left-1/2 -translate-x-1/2 px-2 py-1 rounded-lg bg-gray-900 text-white text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                              {data.orders} 单 · {formatCurrency(data.income)}
                            </div>
                          )}
                          {isToday && (
                            <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-white shadow-sm" />
                          )}
                        </div>
                      </div>
                      <span
                        className={cn(
                          'text-xs font-medium',
                          isToday ? 'text-brand-600' : 'text-gray-400'
                        )}
                      >
                        {data.day}
                      </span>
                    </div>
                  );
                })}
              </div>
            </Card>

            <Card hover className="animate-fade-in-up" style={{ animationDelay: '100ms' }}>
              <div className="flex items-center gap-2 mb-5">
                <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
                  <AlertCircle className="w-5 h-5 text-amber-500" />
                </div>
                <h3 className="text-base font-semibold text-gray-900">快捷操作</h3>
              </div>

              <div className="space-y-3">
                <button
                  onClick={() => navigate('/provider/calendar')}
                  className={cn(
                    'w-full flex items-center gap-3 p-4 rounded-xl transition-all duration-200',
                    'bg-gradient-to-r from-amber-50/80 to-orange-50/50 border border-amber-100/50 hover:border-amber-200 hover:shadow-soft',
                    pendingConfirmOrders.length > 0 ? 'animate-pulse-soft' : ''
                  )}
                >
                  <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm">
                    <CheckCircle2 className="w-5 h-5 text-amber-600" />
                  </div>
                  <div className="flex-1 min-w-0 text-left">
                    <div className="text-sm font-semibold text-gray-800">确认待接订单</div>
                    <div className="text-xs text-gray-500">
                      {pendingConfirmOrders.length > 0
                        ? `${pendingConfirmOrders.length} 个订单等待确认`
                        : '暂无待确认订单'}
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400 shrink-0" />
                </button>

                <button
                  onClick={() => navigate('/provider/updates')}
                  className="w-full flex items-center gap-3 p-4 rounded-xl bg-gradient-to-r from-brand-50/80 to-petal-50/50 border border-brand-100/50 hover:border-brand-200 hover:shadow-soft transition-all duration-200"
                >
                  <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm">
                    <ImagePlus className="w-5 h-5 text-brand-600" />
                  </div>
                  <div className="flex-1 min-w-0 text-left">
                    <div className="text-sm font-semibold text-gray-800">发布今日动态</div>
                    <div className="text-xs text-gray-500">让宠主看到宝贝们的日常</div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400 shrink-0" />
                </button>

                <button
                  onClick={() => navigate('/provider/pets')}
                  className="w-full flex items-center gap-3 p-4 rounded-xl bg-gradient-to-r from-forest-50/80 to-green-50/50 border border-forest-100/50 hover:border-forest-200 hover:shadow-soft transition-all duration-200"
                >
                  <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm">
                    <Calendar className="w-5 h-5 text-forest-600" />
                  </div>
                  <div className="flex-1 min-w-0 text-left">
                    <div className="text-sm font-semibold text-gray-800">查看今日宠物</div>
                    <div className="text-xs text-gray-500">
                      {todayAppointments.length + inServicePets.length} 只宠物在照顾中
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400 shrink-0" />
                </button>

                <button
                  onClick={() => navigate('/provider/revenue')}
                  className="w-full flex items-center gap-3 p-4 rounded-xl bg-gradient-to-r from-purple-50/80 to-blue-50/50 border border-purple-100/50 hover:border-purple-200 hover:shadow-soft transition-all duration-200"
                >
                  <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm">
                    <DollarSign className="w-5 h-5 text-purple-600" />
                  </div>
                  <div className="flex-1 min-w-0 text-left">
                    <div className="text-sm font-semibold text-gray-800">查看收入明细</div>
                    <div className="text-xs text-gray-500">
                      今日收入 {formatCurrency(todayIncome)}
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400 shrink-0" />
                </button>
              </div>

              {pendingConfirmOrders.length > 0 && (
                <div className="mt-5 pt-5 border-t border-gray-50">
                  <div className="text-xs font-medium text-gray-500 mb-3">待确认订单</div>
                  <div className="space-y-2">
                    {pendingConfirmOrders.slice(0, 2).map((order) => {
                      const pet = getPetForOrder(order);
                      return (
                        <div key={order.id} className="flex items-center gap-3 p-2.5 rounded-xl bg-gray-50/50 hover:bg-gray-50 transition-colors">
                          <div className="w-10 h-10 rounded-xl bg-petal-50 flex items-center justify-center shrink-0">
                            <PawPrint className="w-5 h-5 text-pink-500" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium text-gray-800 truncate">
                              {pet?.name || '未知宠物'} · {formatDate(order.startDate, 'M月d日')}
                            </div>
                            <div className="text-xs text-gray-500 truncate">
                              {formatCurrency(order.totalPrice)}
                            </div>
                          </div>
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => handleConfirmOrder(order.id)}
                          >
                            确认
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </Card>
          </div>

          <Card>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-petal-50 flex items-center justify-center">
                  <PawPrint className="w-5 h-5 text-pink-600" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-gray-900">今日预约</h3>
                  <p className="text-xs text-gray-400 mt-0.5">今天即将入住的宠物们</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/provider/pets')}
                icon={<ChevronRight className="w-4 h-4" />}
              >
                查看全部
              </Button>
            </div>

            {upcomingPets.length === 0 ? (
              <Empty
                title="暂无今日预约"
                description="未来7天没有预约订单"
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                {upcomingPets.slice(0, 6).map((order, idx) => {
                  const pet = getPetForOrder(order);
                  if (!pet) return null;
                  return (
                    <div key={order.id} style={{ animationDelay: `${idx * 50}ms` }}>
                      <PetCard
                        pet={pet as any}
                        order={order as any}
                        onViewDetail={() => setShowPetModal({ order, pet })}
                      />
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </div>
      </main>

      {showPetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl shadow-card max-w-md w-full max-h-[90vh] overflow-auto animate-scale-in">
            <div className="p-6 border-b border-gray-50">
              <h3 className="text-lg font-bold text-gray-900">{showPetModal.pet.name} 详情</h3>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-4">
                <Avatar size="xl" src={(showPetModal.pet as any).avatar} name={showPetModal.pet.name} />
                <div>
                  <div className="text-xl font-bold text-gray-900">{showPetModal.pet.name}</div>
                  <div className="text-sm text-gray-500">
                    {showPetModal.pet.breed} · {showPetModal.pet.age}岁 · {showPetModal.pet.weight}kg
                  </div>
                </div>
              </div>
              <div className="bg-gray-50/70 rounded-xl p-4 text-sm text-gray-600 leading-relaxed">
                {showPetModal.pet.description || '暂无描述'}
              </div>
              {showPetModal.order.specialInstructions && (
                <div className="bg-amber-50/70 rounded-xl p-4 border border-amber-100">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertCircle className="w-4 h-4 text-amber-600" />
                    <span className="text-sm font-semibold text-amber-800">特殊注意事项</span>
                  </div>
                  <p className="text-sm text-amber-700 leading-relaxed">
                    {showPetModal.order.specialInstructions}
                  </p>
                </div>
              )}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => navigate(`/orders/${showPetModal.order.id}`)}
                >
                  查看订单
                </Button>
                <Button
                  size="sm"
                  onClick={() => setShowPetModal(null)}
                >
                  关闭
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
