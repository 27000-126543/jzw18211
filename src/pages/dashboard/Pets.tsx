import { useState, useMemo } from 'react';
import {
  PawPrint,
  X,
  Syringe,
  AlertTriangle,
  Phone,
  CalendarDays,
  Clock,
  Home,
  CheckCircle2,
  XCircle,
  User,
  FileText,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/store';
import ProviderSidebar from '@/components/layout/ProviderSidebar';
import PetCard from '@/components/dashboard/PetCard';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';
import Avatar from '@/components/common/Avatar';
import Empty from '@/components/Empty';
import { getServiceLabel, formatCurrency } from '@/utils/format';
import { formatDate, isSameDay, addDays } from '@/utils/date';
import type { Order } from '@/types';

type TabType = 'upcoming' | 'in_service' | 'departed';

const TABS: { id: TabType; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'upcoming', label: '即将入住', icon: CalendarDays },
  { id: 'in_service', label: '服务中', icon: PawPrint },
  { id: 'departed', label: '已离开', icon: Home },
];

export default function DashboardPets() {
  const { orders, providers, pets, users, currentUser } = useAppStore();
  const [activeTab, setActiveTab] = useState<TabType>('upcoming');
  const [selectedPet, setSelectedPet] = useState<{ order: Order; pet: any; owner: any } | null>(null);

  const currentProvider = useMemo(() => {
    return providers.find((p) => p.userId === currentUser?.id) || providers[0];
  }, [providers, currentUser]);

  const today = new Date('2026-06-18');

  const providerOrders = useMemo(() => {
    if (!currentProvider) return [] as Order[];
    return orders.filter((o) => o.providerId === currentProvider.id && o.status !== 'cancelled');
  }, [orders, currentProvider]);

  const { upcomingPets, inServicePets, departedPets } = useMemo(() => {
    const upcoming: Order[] = [];
    const inService: Order[] = [];
    const departed: Order[] = [];

    providerOrders.forEach((order) => {
      const startDate = new Date(order.startDate);
      const endDate = new Date(order.endDate);

      if (order.status === 'in_service') {
        inService.push(order);
      } else if (
        order.status === 'completed' ||
        (endDate < today && order.status !== 'cancelled')
      ) {
        departed.push(order);
      } else if (startDate >= today || order.status === 'pending_confirm' || order.status === 'confirmed') {
        upcoming.push(order);
      }
    });

    upcoming.sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
    inService.sort((a, b) => new Date(b.endDate).getTime() - new Date(a.endDate).getTime());
    departed.sort((a, b) => new Date(b.endDate).getTime() - new Date(a.endDate).getTime());

    return { upcomingPets: upcoming, inServicePets: inService, departedPets: departed };
  }, [providerOrders, today]);

  const displayList = useMemo(() => {
    switch (activeTab) {
      case 'upcoming':
        return upcomingPets;
      case 'in_service':
        return inServicePets;
      case 'departed':
        return departedPets;
    }
  }, [activeTab, upcomingPets, inServicePets, departedPets]);

  const tabCounts = {
    upcoming: upcomingPets.length,
    in_service: inServicePets.length,
    departed: departedPets.length,
  };

  const getPetInfo = (order: Order) => {
    const pet = pets.find((p) => p.id === order.petId);
    const owner = users.find((u) => u.id === order.ownerId);
    return { pet, owner };
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream-50/30 via-white to-petal-50/20 flex">
      <ProviderSidebar />

      <main className="flex-1 min-w-0 p-6 md:p-8 overflow-auto">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-petal-100 to-pink-100 flex items-center justify-center">
                <PawPrint className="w-6 h-6 text-pink-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">待接宠物</h1>
                <p className="text-sm text-gray-500">查看和管理所有宠物的寄养信息</p>
              </div>
            </div>
          </div>

          <Card padding="none" className="mb-6 overflow-hidden">
            <div className="flex border-b border-gray-100">
              {TABS.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={cn(
                      'flex-1 min-w-[120px] flex items-center justify-center gap-2 px-6 py-4',
                      'text-sm font-medium transition-all duration-200 relative',
                      isActive
                        ? 'text-brand-600 bg-brand-50/40'
                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50/50'
                    )}
                  >
                    <Icon className={cn('w-4 h-4', isActive ? 'text-brand-500' : '')} />
                    {tab.label}
                    <span
                      className={cn(
                        'px-2 py-0.5 rounded-full text-[10px] font-semibold',
                        isActive ? 'bg-brand-500 text-white' : 'bg-gray-100 text-gray-500'
                      )}
                    >
                      {tabCounts[tab.id]}
                    </span>
                    {isActive && (
                      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-500 rounded-t" />
                    )}
                  </button>
                );
              })}
            </div>
          </Card>

          {displayList.length === 0 ? (
            <Empty
              title={activeTab === 'upcoming' ? '暂无即将入住的宠物' : activeTab === 'in_service' ? '暂无服务中的宠物' : '暂无已离开的宠物'}
              description="等待新订单预约吧~"
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {displayList.map((order, idx) => {
                const { pet } = getPetInfo(order);
                if (!pet) return null;
                return (
                  <div key={order.id} style={{ animationDelay: `${idx * 40}ms` }}>
                    <PetCard
                      pet={pet as any}
                      order={order as any}
                      onViewDetail={() => {
                        const { pet: p, owner: o } = getPetInfo(order);
                        setSelectedPet({ order, pet: p, owner: o });
                      }}
                    />
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {selectedPet && selectedPet.pet && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl shadow-card max-w-2xl w-full max-h-[92vh] overflow-auto animate-scale-in">
            <div className="sticky top-0 bg-gradient-to-br from-petal-50 via-white to-brand-50/50 border-b border-gray-100 z-10">
              <div className="p-6 pb-5">
                <div className="flex items-start gap-5">
                  <div className="relative shrink-0">
                    <div className="w-20 h-20 rounded-2xl bg-white shadow-card flex items-center justify-center overflow-hidden">
                      {(selectedPet.pet as any).avatar ? (
                        <img
                          src={(selectedPet.pet as any).avatar}
                          alt={selectedPet.pet.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <PawPrint className="w-10 h-10 text-brand-400" />
                      )}
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-white shadow-sm flex items-center justify-center">
                      <div
                        className={cn(
                          'w-4 h-4 rounded-full',
                          selectedPet.pet.vaccinated ? 'bg-forest-500' : 'bg-red-400'
                        )}
                      />
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3 mb-1">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">{selectedPet.pet.name}</h3>
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-gray-500 mt-1">
                          <span>{selectedPet.pet.breed}</span>
                          <span className="w-1 h-1 rounded-full bg-gray-300" />
                          <span>{selectedPet.pet.age}岁</span>
                          <span className="w-1 h-1 rounded-full bg-gray-300" />
                          <span>{selectedPet.pet.weight}kg</span>
                        </div>
                      </div>
                      <button
                        onClick={() => setSelectedPet(null)}
                        className="w-9 h-9 rounded-xl flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all shrink-0"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    <div className="flex flex-wrap gap-2 mt-3">
                      <span className={cn(
                        'inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium',
                        selectedPet.pet.vaccinated
                          ? 'bg-forest-50 text-forest-700'
                          : 'bg-red-50 text-red-600'
                      )}>
                        {selectedPet.pet.vaccinated ? (
                          <><CheckCircle2 className="w-3 h-3" /> 疫苗已接种</>
                        ) : (
                          <><XCircle className="w-3 h-3" /> 疫苗未接种</>
                        )}
                      </span>
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                        {selectedPet.pet.species === 'dog' ? '狗狗' : selectedPet.pet.species === 'cat' ? '猫咪' : '其他'}
                      </span>
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-brand-50 text-brand-700">
                        {getServiceLabel(selectedPet.order.serviceType)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {selectedPet.owner && (
                <div className="bg-gradient-to-r from-blue-50/60 to-cream-50 rounded-2xl p-5 border border-blue-100/50">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center">
                      <User className="w-4 h-4 text-blue-600" />
                    </div>
                    <h4 className="text-sm font-semibold text-gray-900">主人信息</h4>
                  </div>
                  <div className="flex items-center gap-4">
                    <Avatar size="md" src={(selectedPet.owner as any).avatar} name={selectedPet.owner.name} />
                    <div className="flex-1 min-w-0">
                      <div className="text-base font-semibold text-gray-900 mb-0.5">{selectedPet.owner.name}</div>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span className="inline-flex items-center gap-1.5">
                          <Phone className="w-3.5 h-3.5" />
                          {selectedPet.owner.phone}
                        </span>
                        <span className="inline-flex items-center gap-1.5">
                          <FileText className="w-3.5 h-3.5" />
                          {selectedPet.owner.email}
                        </span>
                      </div>
                    </div>
                    <Button size="sm" variant="outline" icon={<Phone className="w-4 h-4" />}>
                      联系
                    </Button>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50/70 rounded-2xl p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 rounded-lg bg-brand-50 flex items-center justify-center">
                      <CalendarDays className="w-4 h-4 text-brand-600" />
                    </div>
                    <h4 className="text-sm font-semibold text-gray-900">预约详情</h4>
                  </div>
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">入住日期</span>
                      <span className="text-sm font-medium text-gray-800">{formatDate(selectedPet.order.startDate)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">离开日期</span>
                      <span className="text-sm font-medium text-gray-800">{formatDate(selectedPet.order.endDate)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">服务类型</span>
                      <span className="text-sm font-medium text-gray-800">{getServiceLabel(selectedPet.order.serviceType)}</span>
                    </div>
                    <div className="h-px bg-gray-200/60 my-1" />
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">订单金额</span>
                      <span className="text-lg font-bold text-brand-600">{formatCurrency(selectedPet.order.totalPrice)}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50/70 rounded-2xl p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 rounded-lg bg-forest-50 flex items-center justify-center">
                      <Syringe className="w-4 h-4 text-forest-600" />
                    </div>
                    <h4 className="text-sm font-semibold text-gray-900">疫苗记录</h4>
                  </div>
                  {selectedPet.pet.vaccinated ? (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 p-3 rounded-xl bg-forest-50 border border-forest-100">
                        <CheckCircle2 className="w-4 h-4 text-forest-600 shrink-0" />
                        <span className="text-sm text-forest-800">狂犬疫苗</span>
                      </div>
                      <div className="flex items-center gap-2 p-3 rounded-xl bg-forest-50 border border-forest-100">
                        <CheckCircle2 className="w-4 h-4 text-forest-600 shrink-0" />
                        <span className="text-sm text-forest-800">
                          {selectedPet.pet.species === 'cat' ? '猫三联' : '犬六联'}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 border border-red-100">
                      <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                      <span className="text-sm text-red-700">疫苗信息不完整，请与主人确认</span>
                    </div>
                  )}
                </div>
              </div>

              {selectedPet.pet.description && (
                <div className="bg-gray-50/70 rounded-2xl p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center">
                      <FileText className="w-4 h-4 text-purple-600" />
                    </div>
                    <h4 className="text-sm font-semibold text-gray-900">宠物简介</h4>
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {selectedPet.pet.description}
                  </p>
                </div>
              )}

              {selectedPet.order.specialInstructions && (
                <div className="bg-gradient-to-br from-amber-50/80 to-orange-50/40 rounded-2xl p-5 border border-amber-100">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center">
                      <AlertTriangle className="w-4 h-4 text-amber-600" />
                    </div>
                    <h4 className="text-sm font-semibold text-amber-900">特殊注意事项</h4>
                  </div>
                  <p className="text-sm text-amber-800 leading-relaxed">
                    {selectedPet.order.specialInstructions}
                  </p>
                </div>
              )}

              <div className="flex flex-wrap gap-2 pt-2">
                <Button variant="ghost" onClick={() => setSelectedPet(null)}>
                  关闭
                </Button>
                <Button
                  onClick={() => {
                    setSelectedPet(null);
                  }}
                >
                  查看完整订单
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
