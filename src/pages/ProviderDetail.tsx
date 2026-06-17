import { useState, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  MapPin,
  Navigation,
  Clock,
  MessageSquare,
  ChevronRight,
  Home,
  PawPrint,
  Sun,
  Home as HomeIcon,
  Bed,
  CalendarDays,
  Users,
  Info,
} from 'lucide-react';
import { useAppStore } from '@/store';
import type { Provider, Service, ServiceType } from '@/types';
import StarRating from '@/components/common/StarRating';
import Button from '@/components/common/Button';
import PhotoGallery from '@/components/provider/PhotoGallery';
import ServiceCard from '@/components/provider/ServiceCard';
import AvailabilityCalendar from '@/components/provider/AvailabilityCalendar';
import ReviewList from '@/components/provider/ReviewList';
import { formatCurrency, getServiceLabel } from '@/utils/format';
import { getDaysBetween } from '@/utils/date';
import { cn } from '@/lib/utils';

interface SelectedRange {
  start?: string;
  end?: string;
}

const serviceIconMap: Record<ServiceType, typeof Sun> = {
  daycare: Sun,
  home_visit: HomeIcon,
  boarding: Bed,
};

const speciesLabelMap: Record<string, { label: string; emoji: string }> = {
  dog: { label: '狗狗', emoji: '🐕' },
  cat: { label: '猫咪', emoji: '🐱' },
  other: { label: '其他', emoji: '🐾' },
};

export default function ProviderDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const providers = useAppStore((state) => state.providers);
  const users = useAppStore((state) => state.users);
  const reviews = useAppStore((state) => state.reviews);
  const pets = useAppStore((state) => state.pets);
  const currentUser = useAppStore((state) => state.currentUser);

  const provider = useMemo<Provider | undefined>(
    () => providers.find((p) => p.id === id),
    [providers, id]
  );

  const galleryPhotos = useMemo(() => {
    if (!provider) return [];
    return provider.photos.map((p, idx) => ({
      id: p.id,
      providerId: id || '',
      url: p.url,
      caption: p.caption,
      uploadedAt: new Date(Date.now() - idx * 86400000).toISOString(),
    }));
  }, [provider, id]);

  const providerReviews = useMemo(
    () =>
      reviews
        .filter((r) => r.providerId === id)
        .map((r) => ({
          id: r.id,
          orderId: r.orderId,
          ownerId: (r as any).reviewerId || (r as any).ownerId,
          providerId: r.providerId,
          rating: r.rating,
          content: r.content,
          photos: (r as any).images || (r as any).photos || [],
          reply: (r as any).response || (r as any).reply,
          createdAt: r.createdAt,
        })),
    [reviews, id]
  );

  const userPetsCount = useMemo(() => {
    if (!currentUser) return 0;
    return pets.filter((p) => p.ownerId === currentUser.id).length;
  }, [pets, currentUser]);

  const [selectedServiceType, setSelectedServiceType] = useState<ServiceType>(
    provider?.services[0]?.type || 'boarding'
  );
  const [selectedRange, setSelectedRange] = useState<SelectedRange>({});
  const [petCount, setPetCount] = useState(1);

  const selectedService = useMemo<Service | undefined>(() => {
    return provider?.services.find((s) => s.type === selectedServiceType);
  }, [provider, selectedServiceType]);

  const daysCount = useMemo(() => {
    if (selectedRange.start && selectedRange.end) {
      return getDaysBetween(selectedRange.start, selectedRange.end);
    }
    return 0;
  }, [selectedRange]);

  const estimatedPrice = useMemo(() => {
    const dailyPrice = selectedService?.dailyPrice || 0;
    const days = daysCount > 0 ? daysCount : 1;
    const serviceTotal = dailyPrice * days * petCount;
    const platformFee = Math.round(serviceTotal * 0.05 * 100) / 100;
    return serviceTotal + platformFee;
  }, [selectedService, daysCount, petCount]);

  if (!provider) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 mb-4">商家不存在或已下架</p>
          <Link to="/">
            <Button>返回首页</Button>
          </Link>
        </div>
      </div>
    );
  }

  const handleQuickBooking = () => {
    navigate(`/booking/${provider.id}`);
  };

  const handleNavigate = () => {
    const url = `https://maps.google.com/?q=${provider.latitude},${provider.longitude}`;
    window.open(url, '_blank');
  };

  const handleContact = () => {
    navigate(`/chat/${provider.id}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-28 md:pb-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
          <Link
            to="/"
            className="flex items-center gap-1 hover:text-brand-600 transition-colors"
          >
            <Home className="w-4 h-4" />
            <span>首页</span>
          </Link>
          <ChevronRight className="w-4 h-4" />
          <Link
            to="/"
            className="hover:text-brand-600 transition-colors"
          >
            商家列表
          </Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-gray-900 font-medium truncate">
            {provider.name}
          </span>
        </nav>

        <div className="bg-white rounded-3xl shadow-soft border border-gray-100 p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-6">
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0">
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center gap-3">
                    {provider.name}
                    {provider.rating >= 4.8 && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-700 text-xs font-medium">
                        ⭐ 优质商家
                      </span>
                    )}
                  </h1>

                  <div className="flex flex-wrap items-center gap-4 mt-3">
                    <div className="flex items-center gap-2">
                      <StarRating value={provider.rating} size="sm" />
                      <span className="text-sm font-medium text-gray-900">
                        {provider.rating.toFixed(1)}
                      </span>
                      <span className="text-sm text-gray-500">
                        ({provider.reviewCount}条评价)
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    size="md"
                    onClick={handleContact}
                  >
                    <MessageSquare className="w-4 h-4" />
                    联系商家
                  </Button>
                  <Button
                    variant="primary"
                    size="md"
                    className="hidden sm:inline-flex"
                    onClick={handleQuickBooking}
                  >
                    立即预约
                  </Button>
                </div>
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <div className="flex items-start gap-3 p-3 rounded-2xl bg-gray-50">
                  <div className="w-9 h-9 rounded-xl bg-brand-100 text-brand-600 flex items-center justify-center shrink-0">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs text-gray-500 mb-0.5">门店地址</div>
                    <div className="text-sm text-gray-900 line-clamp-2">
                      {provider.address}
                    </div>
                  </div>
                  <button
                    onClick={handleNavigate}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-brand-50 text-brand-600 text-xs font-medium hover:bg-brand-100 transition-colors shrink-0"
                  >
                    <Navigation className="w-3.5 h-3.5" />
                    导航
                  </button>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-2xl bg-gray-50">
                  <div className="w-9 h-9 rounded-xl bg-forest-100 text-forest-600 flex items-center justify-center shrink-0">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 mb-0.5">营业时间</div>
                    <div className="text-sm text-gray-900 font-medium">
                      {provider.businessHours}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <PhotoGallery photos={galleryPhotos as any} />
        </div>

        <div className="grid gap-6 lg:grid-cols-12">
          <div className="lg:col-span-8 space-y-6">
            <section className="bg-white rounded-3xl shadow-soft border border-gray-100 p-6">
              <div className="flex items-center gap-2 mb-4">
                <Info className="w-5 h-5 text-brand-500" />
                <h2 className="text-lg font-semibold text-gray-900">关于我们</h2>
              </div>
              <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                {provider.description}
              </p>
            </section>

            <section className="bg-white rounded-3xl shadow-soft border border-gray-100 p-6">
              <div className="flex items-center gap-2 mb-5">
                <PawPrint className="w-5 h-5 text-brand-500" />
                <h2 className="text-lg font-semibold text-gray-900">服务项目与价格</h2>
              </div>
              <div className="space-y-4">
                {provider.services.map((service) => {
                  const Icon = serviceIconMap[service.type];
                  const isSelected = selectedServiceType === service.type;
                  return (
                    <div
                      key={service.id}
                      onClick={() => setSelectedServiceType(service.type)}
                      className={cn(
                        'relative cursor-pointer rounded-2xl p-4 transition-all duration-200 border-2',
                        isSelected
                          ? 'border-brand-500 bg-brand-50 shadow-float'
                          : 'border-gray-100 bg-white hover:border-gray-200 hover:shadow-soft'
                      )}
                    >
                      <div className="flex items-start gap-4">
                        <div
                          className={cn(
                            'flex h-12 w-12 shrink-0 items-center justify-center rounded-xl',
                            isSelected
                              ? 'bg-brand-500 text-white'
                              : 'bg-gray-100 text-gray-600'
                          )}
                        >
                          <Icon className="h-6 w-6" />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <h4 className="font-semibold text-gray-900">
                              {getServiceLabel(service.type)}
                            </h4>
                            <div className="shrink-0 text-right">
                              <span className="text-lg font-bold text-brand-600">
                                {formatCurrency(service.dailyPrice)}
                              </span>
                              <span className="text-xs text-gray-400">/天</span>
                            </div>
                          </div>

                          <p className="mt-1 text-sm text-gray-500">
                            {service.description}
                          </p>
                        </div>
                      </div>

                      {isSelected && (
                        <div className="absolute right-3 top-3 h-5 w-5 rounded-full bg-brand-500 flex items-center justify-center">
                          <svg
                            className="h-3 w-3 text-white"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={3}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>

            <section className="bg-white rounded-3xl shadow-soft border border-gray-100 p-6">
              <div className="flex items-center gap-2 mb-5">
                <Users className="w-5 h-5 text-brand-500" />
                <h2 className="text-lg font-semibold text-gray-900">可接受宠物</h2>
              </div>
              <div className="space-y-5">
                <div>
                  <div className="text-sm text-gray-500 mb-2">宠物类型</div>
                  <div className="flex flex-wrap gap-2">
                    {provider.acceptedPets.species.map((species) => {
                      const info = speciesLabelMap[species] || {
                        label: species,
                        emoji: '🐾',
                      };
                      return (
                        <span
                          key={species}
                          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-cream-50 text-forest-700 text-sm font-medium border border-cream-200"
                        >
                          <span>{info.emoji}</span>
                          <span>{info.label}</span>
                        </span>
                      );
                    })}
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 rounded-2xl bg-gray-50">
                  <div>
                    <div className="text-sm text-gray-500">最多同时接收</div>
                    <div className="text-xl font-bold text-gray-900 mt-1">
                      {provider.acceptedPets.maxCount}
                      <span className="text-sm font-normal text-gray-500 ml-1">
                        只
                      </span>
                    </div>
                  </div>
                  {provider.acceptedPets.breedRestrictions &&
                    provider.acceptedPets.breedRestrictions.length > 0 && (
                      <div className="text-right">
                        <div className="text-sm text-gray-500">暂不接受品种</div>
                        <div className="text-sm font-medium text-red-600 mt-1">
                          {provider.acceptedPets.breedRestrictions.join('、')}
                        </div>
                      </div>
                    )}
                </div>
              </div>
            </section>

            <section className="bg-white rounded-3xl shadow-soft border border-gray-100 p-6">
              <div className="flex items-center gap-2 mb-5">
                <CalendarDays className="w-5 h-5 text-brand-500" />
                <h2 className="text-lg font-semibold text-gray-900">空位日历</h2>
              </div>
              <AvailabilityCalendar
                provider={provider}
                selectedRange={selectedRange}
                onSelectRange={setSelectedRange}
              />
            </section>

            <section className="bg-white rounded-3xl shadow-soft border border-gray-100 p-6">
              <div className="flex items-center gap-2 mb-5">
                <StarRating value={5} size="sm" />
                <h2 className="text-lg font-semibold text-gray-900">用户评价</h2>
              </div>
              <ReviewList reviews={providerReviews as any} users={users} />
            </section>
          </div>

          <div className="lg:col-span-4">
            <div className="lg:sticky lg:top-6 space-y-4">
              <div className="bg-white rounded-3xl shadow-soft border border-gray-100 p-5">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  快速预约
                </h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      服务类型
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {(['daycare', 'home_visit', 'boarding'] as ServiceType[]).map(
                        (type) => {
                          const Icon = serviceIconMap[type];
                          const hasService = provider.services.some(
                            (s) => s.type === type
                          );
                          const isSelected = selectedServiceType === type;
                          return (
                            <button
                              key={type}
                              disabled={!hasService}
                              onClick={() => hasService && setSelectedServiceType(type)}
                              className={cn(
                                'flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl border-2 transition-all duration-200',
                                !hasService &&
                                  'opacity-40 cursor-not-allowed border-gray-100 bg-gray-50',
                                hasService &&
                                  isSelected &&
                                  'border-brand-500 bg-brand-50',
                                hasService &&
                                  !isSelected &&
                                  'border-gray-100 bg-white hover:border-gray-200'
                              )}
                            >
                              <Icon
                                className={cn(
                                  'w-5 h-5',
                                  isSelected
                                    ? 'text-brand-500'
                                    : 'text-gray-500'
                                )}
                              />
                              <span
                                className={cn(
                                  'text-xs font-medium',
                                  isSelected
                                    ? 'text-brand-700'
                                    : 'text-gray-600'
                                )}
                              >
                                {getServiceLabel(type)}
                              </span>
                            </button>
                          );
                        }
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      日期范围
                    </label>
                    <div className="rounded-xl border border-gray-200 bg-gray-50 p-3">
                      {selectedRange.start && selectedRange.end ? (
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-900 font-medium">
                            {selectedRange.start.slice(5).replace('-', '/')}
                          </span>
                          <div className="flex items-center gap-2 text-brand-600">
                            <span className="font-bold">{daysCount}</span>
                            <span className="text-gray-500">天</span>
                          </div>
                          <span className="text-gray-900 font-medium">
                            {selectedRange.end.slice(5).replace('-', '/')}
                          </span>
                        </div>
                      ) : (
                        <p className="text-sm text-gray-400 text-center">
                          请在左侧日历中选择日期
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      宠物数量
                    </label>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setPetCount((c) => Math.max(1, c - 1))}
                        className="w-10 h-10 rounded-xl border border-gray-200 bg-white flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-colors"
                      >
                        −
                      </button>
                      <div className="flex-1 text-center">
                        <span className="text-xl font-bold text-gray-900">
                          {petCount}
                        </span>
                        {userPetsCount > 0 && (
                          <span className="text-xs text-gray-400 ml-1">
                            / 已登记{userPetsCount}只
                          </span>
                        )}
                      </div>
                      <button
                        onClick={() =>
                          setPetCount((c) =>
                            Math.min(provider.acceptedPets.maxCount, c + 1)
                          )
                        }
                        className="w-10 h-10 rounded-xl border border-gray-200 bg-white flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-colors"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-100">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-500">预估价格</span>
                      <span className="text-xs text-gray-400">含平台服务费</span>
                    </div>
                    <div className="text-3xl font-bold text-brand-600">
                      {formatCurrency(estimatedPrice)}
                    </div>
                  </div>

                  <Button
                    fullWidth
                    size="lg"
                    onClick={handleQuickBooking}
                    className="mt-2"
                  >
                    立即预约
                  </Button>

                  <p className="text-xs text-gray-400 text-center">
                    预约仅需支付30%定金，确认服务后支付尾款
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 z-40 lg:hidden">
        <div className="bg-white border-t border-gray-200 px-4 py-3 safe-area-inset-bottom">
          <div className="flex items-center gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1">
                <span className="text-xs text-gray-500">预估</span>
                <span className="text-2xl font-bold text-brand-600">
                  {formatCurrency(estimatedPrice)}
                </span>
              </div>
            </div>
            <button
              onClick={handleContact}
              className="flex flex-col items-center justify-center w-12 h-12 rounded-xl bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
            >
              <MessageSquare className="w-5 h-5" />
            </button>
            <Button size="lg" onClick={handleQuickBooking} className="flex-1">
              立即预约
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
