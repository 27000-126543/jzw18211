import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Calendar,
  Filter,
  ChevronRight,
  CheckCircle2,
  PlayCircle,
  X,
  PawPrint,
  User,
  MapPin,
  Phone,
  DollarSign,
  Clock,
  AlertCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/store';
import ProviderSidebar from '@/components/layout/ProviderSidebar';
import CalendarBoard from '@/components/dashboard/CalendarBoard';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';
import Input from '@/components/common/Input';
import Avatar from '@/components/common/Avatar';
import { getServiceLabel, getStatusLabel, getStatusColor, formatCurrency } from '@/utils/format';
import { formatDate, isSameDay } from '@/utils/date';
import type { Order, ServiceType } from '@/types';

type ServiceFilter = 'all' | ServiceType;
type OrderStatusFilter = 'all' | 'pending_confirm' | 'confirmed' | 'in_service' | 'completed';

const SERVICE_FILTERS: { id: ServiceFilter; label: string }[] = [
  { id: 'all', label: '全部服务' },
  { id: 'daycare', label: '日间照料' },
  { id: 'home_visit', label: '上门喂养' },
  { id: 'boarding', label: '住宿寄养' },
];

const STATUS_FILTERS: { id: OrderStatusFilter; label: string; dotClass: string }[] = [
  { id: 'all', label: '全部状态', dotClass: 'bg-gray-400' },
  { id: 'pending_confirm', label: '待确认', dotClass: 'bg-amber-500' },
  { id: 'confirmed', label: '已确认', dotClass: 'bg-blue-500' },
  { id: 'in_service', label: '服务中', dotClass: 'bg-forest-500' },
  { id: 'completed', label: '已完成', dotClass: 'bg-gray-500' },
];

export default function DashboardCalendar() {
  const navigate = useNavigate();
  const { orders, providers, pets, users, currentUser, updateOrderStatus } = useAppStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [serviceFilter, setServiceFilter] = useState<ServiceFilter>('all');
  const [statusFilter, setStatusFilter] = useState<OrderStatusFilter>('all');
  const [dateRange, setDateRange] = useState<{ start: string; end: string }>({
    start: '',
    end: '',
  });
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const currentProvider = useMemo(() => {
    return providers.find((p) => p.userId === currentUser?.id) || providers[0];
  }, [providers, currentUser]);

  const filteredOrders = useMemo(() => {
    if (!currentProvider) return [] as Order[];
    return orders
      .filter((o) => o.providerId === currentProvider.id)
      .filter((o) => serviceFilter === 'all' || o.serviceType === serviceFilter)
      .filter((o) => statusFilter === 'all' || o.status === statusFilter)
      .filter((o) => {
        if (!searchQuery.trim()) return true;
        const pet = pets.find((p) => p.id === o.petId);
        const owner = users.find((u) => u.id === o.ownerId);
        const query = searchQuery.toLowerCase();
        return (
          pet?.name.toLowerCase().includes(query) ||
          pet?.breed.toLowerCase().includes(query) ||
          owner?.name.toLowerCase().includes(query) ||
          o.id.toLowerCase().includes(query)
        );
      })
      .filter((o) => {
        if (!dateRange.start && !dateRange.end) return true;
        const orderStart = new Date(o.startDate);
        const orderEnd = new Date(o.endDate);
        if (dateRange.start && orderEnd < new Date(dateRange.start)) return false;
        if (dateRange.end && orderStart > new Date(dateRange.end)) return false;
        return true;
      });
  }, [orders, currentProvider, serviceFilter, statusFilter, searchQuery, dateRange, pets, users]);

  const selectedOrderPet = useMemo(() => {
    if (!selectedOrder) return null;
    return pets.find((p) => p.id === selectedOrder.petId);
  }, [selectedOrder, pets]);

  const selectedOrderOwner = useMemo(() => {
    if (!selectedOrder) return null;
    return users.find((u) => u.id === selectedOrder.ownerId);
  }, [selectedOrder, users]);

  const stats = useMemo(() => {
    const today = new Date('2026-06-18');
    const todayCount = filteredOrders.filter((o) => isSameDay(o.startDate, today)).length;
    const pendingCount = filteredOrders.filter((o) => o.status === 'pending_confirm').length;
    const inServiceCount = filteredOrders.filter((o) => o.status === 'in_service').length;
    const totalIncome = filteredOrders
      .filter((o) => o.status !== 'cancelled')
      .reduce((s, o) => s + o.totalPrice, 0);
    return { todayCount, pendingCount, inServiceCount, totalIncome };
  }, [filteredOrders]);

  const handleStatusChange = (orderId: string, status: Order['status']) => {
    updateOrderStatus(orderId, status);
    if (selectedOrder?.id === orderId) {
      setSelectedOrder({ ...selectedOrder, status });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream-50/30 via-white to-petal-50/20 flex">
      <ProviderSidebar />

      <main className="flex-1 min-w-0 p-6 md:p-8 overflow-auto">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-100 to-brand-100 flex items-center justify-center">
                <Calendar className="w-6 h-6 text-brand-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">预约日历</h1>
                <p className="text-sm text-gray-500">查看和管理所有预约订单</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <Card padding="sm">
              <div className="flex items-center gap-3 p-2">
                <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center shrink-0">
                  <Calendar className="w-5 h-5 text-brand-500" />
                </div>
                <div>
                  <div className="text-xs text-gray-500">今日预约</div>
                  <div className="text-xl font-bold text-gray-900">{stats.todayCount}</div>
                </div>
              </div>
            </Card>
            <Card padding="sm">
              <div className="flex items-center gap-3 p-2">
                <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center shrink-0">
                  <AlertCircle className="w-5 h-5 text-amber-500" />
                </div>
                <div>
                  <div className="text-xs text-gray-500">待确认</div>
                  <div className="text-xl font-bold text-gray-900">{stats.pendingCount}</div>
                </div>
              </div>
            </Card>
            <Card padding="sm">
              <div className="flex items-center gap-3 p-2">
                <div className="w-10 h-10 rounded-xl bg-forest-50 flex items-center justify-center shrink-0">
                  <PawPrint className="w-5 h-5 text-forest-500" />
                </div>
                <div>
                  <div className="text-xs text-gray-500">服务中</div>
                  <div className="text-xl font-bold text-gray-900">{stats.inServiceCount}</div>
                </div>
              </div>
            </Card>
            <Card padding="sm">
              <div className="flex items-center gap-3 p-2">
                <div className="w-10 h-10 rounded-xl bg-petal-50 flex items-center justify-center shrink-0">
                  <DollarSign className="w-5 h-5 text-pink-600" />
                </div>
                <div>
                  <div className="text-xs text-gray-500">总收入</div>
                  <div className="text-xl font-bold text-gray-900">{formatCurrency(stats.totalIncome)}</div>
                </div>
              </div>
            </Card>
          </div>

          <Card className="mb-6">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                <Input
                  value={searchQuery}
                  onChange={setSearchQuery}
                  placeholder="搜索宠物名、品种、主人姓名..."
                  prefixIcon={<Search className="w-4 h-4" />}
                />
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2">
                  <label className="text-xs text-gray-500 whitespace-nowrap">日期:</label>
                  <input
                    type="date"
                    value={dateRange.start}
                    onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                    className="h-11 px-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-200 focus:border-brand-300"
                  />
                  <span className="text-gray-400">~</span>
                  <input
                    type="date"
                    value={dateRange.end}
                    onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                    className="h-11 px-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-200 focus:border-brand-300"
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t border-gray-50">
              <div className="flex items-center gap-1.5 mr-2">
                <Filter className="w-4 h-4 text-gray-400" />
                <span className="text-xs font-medium text-gray-600">服务类型:</span>
              </div>
              {SERVICE_FILTERS.map((f) => (
                <button
                  key={f.id}
                  onClick={() => setServiceFilter(f.id)}
                  className={cn(
                    'px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200',
                    serviceFilter === f.id
                      ? 'bg-brand-500 text-white shadow-sm'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  )}
                >
                  {f.label}
                </button>
              ))}

              <div className="w-px h-6 bg-gray-200 mx-2 hidden sm:block" />

              <div className="flex items-center gap-1.5 mr-2">
                <span className="text-xs font-medium text-gray-600">订单状态:</span>
              </div>
              {STATUS_FILTERS.map((f) => (
                <button
                  key={f.id}
                  onClick={() => setStatusFilter(f.id)}
                  className={cn(
                    'px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 flex items-center gap-1.5',
                    statusFilter === f.id
                      ? 'bg-brand-500 text-white shadow-sm'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  )}
                >
                  <span className={cn('w-2 h-2 rounded-full', statusFilter === f.id ? 'bg-white' : f.dotClass)} />
                  {f.label}
                </button>
              ))}
            </div>
          </Card>

          <CalendarBoard orders={filteredOrders} providers={currentProvider ? [currentProvider] : []} />

          {filteredOrders.length > 0 && (
            <Card className="mt-6">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-base font-semibold text-gray-900">预约列表</h3>
                <span className="text-xs text-gray-400">共 {filteredOrders.length} 条订单</span>
              </div>

              <div className="space-y-3">
                {filteredOrders.slice(0, 5).map((order) => {
                  const pet = pets.find((p) => p.id === order.petId);
                  const owner = users.find((u) => u.id === order.ownerId);
                  return (
                    <button
                      key={order.id}
                      onClick={() => setSelectedOrder(order)}
                      className="w-full flex items-center gap-4 p-4 rounded-2xl bg-gray-50/50 hover:bg-brand-50/50 hover:border-brand-200 border border-transparent transition-all duration-200 text-left group"
                    >
                      <Avatar size="md" src={(pet as any)?.avatar} name={pet?.name || ''} className="bg-petal-50" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-semibold text-gray-900">{pet?.name}</span>
                          <span className={cn('px-2 py-0.5 rounded-full text-[10px] font-medium border', getStatusColor(order.status))}>
                            {getStatusLabel(order.status)}
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500">
                          <span className="inline-flex items-center gap-1">
                            <User className="w-3 h-3" />
                            {owner?.name}
                          </span>
                          <span className="inline-flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatDate(order.startDate)} ~ {formatDate(order.endDate)}
                          </span>
                          <span className="inline-flex items-center gap-1">
                            <DollarSign className="w-3 h-3" />
                            {formatCurrency(order.totalPrice)}
                          </span>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-brand-500 group-hover:translate-x-0.5 transition-all shrink-0" />
                    </button>
                  );
                })}
              </div>
            </Card>
          )}
        </div>
      </main>

      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl shadow-card max-w-lg w-full max-h-[90vh] overflow-auto animate-scale-in">
            <div className="sticky top-0 bg-white border-b border-gray-50 z-10">
              <div className="flex items-center justify-between p-5">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">订单详情</h3>
                  <p className="text-xs text-gray-500 mt-0.5">订单号: {selectedOrder.id}</p>
                </div>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="w-9 h-9 rounded-xl flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-5 space-y-5">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">订单状态</span>
                <span className={cn('px-3 py-1 rounded-full text-xs font-medium border', getStatusColor(selectedOrder.status))}>
                  {getStatusLabel(selectedOrder.status)}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50/70 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 rounded-lg bg-petal-50 flex items-center justify-center">
                      <PawPrint className="w-4 h-4 text-pink-500" />
                    </div>
                    <span className="text-xs font-medium text-gray-500">宠物信息</span>
                  </div>
                  {selectedOrderPet && (
                    <>
                      <div className="text-sm font-semibold text-gray-900 mb-0.5">{selectedOrderPet.name}</div>
                      <div className="text-xs text-gray-500">{selectedOrderPet.breed} · {selectedOrderPet.age}岁</div>
                    </>
                  )}
                </div>

                <div className="bg-gray-50/70 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                      <User className="w-4 h-4 text-blue-500" />
                    </div>
                    <span className="text-xs font-medium text-gray-500">宠物主人</span>
                  </div>
                  {selectedOrderOwner && (
                    <>
                      <div className="text-sm font-semibold text-gray-900 mb-0.5">{selectedOrderOwner.name}</div>
                      <div className="text-xs text-gray-500">{selectedOrderOwner.phone}</div>
                    </>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">服务类型</span>
                  <span className="text-sm font-medium text-gray-800">{getServiceLabel(selectedOrder.serviceType)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">寄养日期</span>
                  <span className="text-sm font-medium text-gray-800">
                    {formatDate(selectedOrder.startDate)} ~ {formatDate(selectedOrder.endDate)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">订单金额</span>
                  <span className="text-lg font-bold text-brand-600">{formatCurrency(selectedOrder.totalPrice)}</span>
                </div>
              </div>

              {selectedOrder.specialInstructions && (
                <div className="bg-amber-50/70 rounded-xl p-4 border border-amber-100">
                  <div className="flex items-center gap-1.5 mb-2">
                    <AlertCircle className="w-4 h-4 text-amber-600" />
                    <span className="text-sm font-semibold text-amber-800">特殊注意事项</span>
                  </div>
                  <p className="text-sm text-amber-700 leading-relaxed">
                    {selectedOrder.specialInstructions}
                  </p>
                </div>
              )}

              <div className="flex flex-wrap gap-2 pt-2">
                {selectedOrder.status === 'pending_confirm' && (
                  <Button
                    fullWidth
                    icon={<CheckCircle2 className="w-4 h-4" />}
                    onClick={() => handleStatusChange(selectedOrder.id, 'confirmed')}
                  >
                    确认订单
                  </Button>
                )}
                {selectedOrder.status === 'confirmed' && (
                  <Button
                    fullWidth
                    variant="secondary"
                    icon={<PlayCircle className="w-4 h-4" />}
                    onClick={() => handleStatusChange(selectedOrder.id, 'in_service')}
                  >
                    开始服务
                  </Button>
                )}
                {selectedOrder.status === 'in_service' && (
                  <Button
                    fullWidth
                    variant="secondary"
                    icon={<CheckCircle2 className="w-4 h-4" />}
                    onClick={() => handleStatusChange(selectedOrder.id, 'pending_balance')}
                  >
                    结束服务
                  </Button>
                )}
                <Button
                  variant="outline"
                  onClick={() => {
                    setSelectedOrder(null);
                    navigate(`/orders/${selectedOrder.id}`);
                  }}
                >
                  查看完整详情
                </Button>
                <Button variant="ghost" onClick={() => setSelectedOrder(null)}>
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
