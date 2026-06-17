import { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Search,
  MapPin,
  Calendar,
  ChevronDown,
  SlidersHorizontal,
  Star,
  Filter,
  Cat,
  Dog,
  Rabbit,
  X,
  Frown,
} from 'lucide-react';
import { useAppStore } from '@/store';
import type { ServiceType, PetSpecies } from '@/types';
import { getServiceLabel, getProviderName, getServiceDailyPrice, normalizeAcceptedPets } from '@/utils/format';
import { cn } from '@/lib/utils';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Button from '@/components/common/Button';
import Card from '@/components/common/Card';
import ProviderCard from '@/components/provider/ProviderCard';

type SortType = 'default' | 'distance' | 'price_asc' | 'rating';

const sortOptions = [
  { value: 'default', label: '综合排序' },
  { value: 'distance', label: '距离最近' },
  { value: 'price_asc', label: '价格从低到高' },
  { value: 'rating', label: '评分最高' },
];

const serviceTypeOptions: { value: '' | ServiceType; label: string }[] = [
  { value: '', label: '全部服务类型' },
  { value: 'daycare', label: '日间照料' },
  { value: 'home_visit', label: '上门喂养' },
  { value: 'boarding', label: '住宿寄养' },
];

const petOptions: { value: PetSpecies; label: string; icon: typeof Cat }[] = [
  { value: 'dog', label: '狗狗', icon: Dog },
  { value: 'cat', label: '猫咪', icon: Cat },
  { value: 'other', label: '其他', icon: Rabbit },
];

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { providers } = useAppStore();

  const [keyword, setKeyword] = useState(searchParams.get('location') || '');
  const [startDate, setStartDate] = useState(searchParams.get('startDate') || '');
  const [endDate, setEndDate] = useState(searchParams.get('endDate') || '');
  const [serviceType, setServiceType] = useState<'' | ServiceType>(
    (searchParams.get('type') as ServiceType) || ''
  );
  const [sortBy, setSortBy] = useState<SortType>('default');
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(500);
  const [selectedPets, setSelectedPets] = useState<PetSpecies[]>([]);
  const [maxDistance, setMaxDistance] = useState(50);
  const [minRating, setMinRating] = useState(0);
  const [certifiedOnly, setCertifiedOnly] = useState(false);
  const [hasAvailability, setHasAvailability] = useState(false);
  const [showFilters, setShowFilters] = useState(true);
  const [sortOpen, setSortOpen] = useState(false);
  const [serviceTypeOpen, setServiceTypeOpen] = useState(false);

  useEffect(() => {
    const params: Record<string, string> = {};
    if (keyword) params.location = keyword;
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    if (serviceType) params.type = serviceType;
    setSearchParams(params);
  }, [keyword, startDate, endDate, serviceType, setSearchParams]);

  const filteredProviders = useMemo(() => {
    let result = [...providers];

    if (keyword) {
      const lower = keyword.toLowerCase();
      result = result.filter(
        (p) =>
          getProviderName(p).toLowerCase().includes(lower) ||
          p.address.toLowerCase().includes(lower) ||
          (p.city || '').toLowerCase().includes(lower) ||
          (p.description || '').toLowerCase().includes(lower)
      );
    }

    if (serviceType) {
      result = result.filter((p) =>
        p.services.some((s) => s.type === serviceType)
      );
    }

    if (selectedPets.length > 0) {
      result = result.filter((p) => {
        const species = normalizeAcceptedPets((p as any).acceptedPets).species;
        return selectedPets.some((pet) => species.includes(pet));
      });
    }

    if (certifiedOnly) {
      result = result.filter((p) => p.certified);
    }

    if (hasAvailability) {
      result = result.filter((p) =>
        p.availability.some((a) => a.available && a.capacityLeft > 0)
      );
    }

    if (minRating > 0) {
      result = result.filter((p) => p.rating >= minRating);
    }

    const priceFiltered = result.filter((p) => {
      const prices = p.services.map((s) => getServiceDailyPrice(s)).filter((v) => v > 0);
      const minServicePrice = prices.length > 0 ? Math.min(...prices) : 0;
      return minServicePrice >= minPrice && minServicePrice <= maxPrice;
    });
    result = priceFiltered;

    switch (sortBy) {
      case 'rating':
        result.sort((a, b) => b.rating - a.rating);
        break;
      case 'price_asc':
        result.sort((a, b) => {
          const pricesA = a.services.map((s) => getServiceDailyPrice(s)).filter((v) => v > 0);
          const pricesB = b.services.map((s) => getServiceDailyPrice(s)).filter((v) => v > 0);
          const minA = pricesA.length > 0 ? Math.min(...pricesA) : 0;
          const minB = pricesB.length > 0 ? Math.min(...pricesB) : 0;
          return minA - minB;
        });
        break;
      case 'distance':
        result.sort(() => Math.random() - 0.5);
        break;
      default:
        break;
    }

    return result;
  }, [
    providers,
    keyword,
    serviceType,
    selectedPets,
    minPrice,
    maxPrice,
    maxDistance,
    minRating,
    certifiedOnly,
    hasAvailability,
    sortBy,
  ]);

  const togglePet = (pet: PetSpecies) => {
    setSelectedPets((prev) =>
      prev.includes(pet) ? prev.filter((p) => p !== pet) : [...prev, pet]
    );
  };

  const resetFilters = () => {
    setMinPrice(0);
    setMaxPrice(500);
    setSelectedPets([]);
    setMaxDistance(50);
    setMinRating(0);
    setCertifiedOnly(false);
    setHasAvailability(false);
  };

  return (
    <div className="min-h-screen flex flex-col bg-cream-50">
      <Header />

      <main className="flex-1">
        {/* Top Search Bar */}
        <div className="sticky top-[72px] md:top-[80px] z-40 bg-white/90 backdrop-blur-lg border-b border-gray-100 shadow-sm">
          <div className="container mx-auto py-4">
            <div className="flex flex-col lg:flex-row gap-3">
              <div className="flex-1 flex items-center gap-3 px-4 py-3 bg-cream-50 rounded-2xl border border-transparent focus-within:border-brand-300 transition-colors">
                <Search className="w-5 h-5 text-brand-500 shrink-0" />
                <input
                  type="text"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  placeholder="搜索商家名称、地址或关键词"
                  className="w-full bg-transparent outline-none text-sm text-gray-900 placeholder:text-gray-400"
                />
                {keyword && (
                  <button
                    onClick={() => setKeyword('')}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              <div className="flex items-center gap-3 px-4 py-3 bg-cream-50 rounded-2xl">
                <Calendar className="w-5 h-5 text-brand-500 shrink-0" />
                <div className="flex items-center gap-2 text-sm flex-1">
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="bg-transparent outline-none text-gray-900 placeholder:text-gray-400 w-full min-w-[100px]"
                  />
                  <span className="text-gray-400 shrink-0">至</span>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="bg-transparent outline-none text-gray-900 placeholder:text-gray-400 w-full min-w-[100px]"
                  />
                </div>
              </div>

              <div className="relative">
                <button
                  onClick={() => setServiceTypeOpen(!serviceTypeOpen)}
                  className="w-full lg:w-auto flex items-center gap-3 px-4 py-3 bg-cream-50 rounded-2xl text-sm text-gray-700 hover:bg-cream-100 transition-colors min-w-[160px]"
                >
                  <Filter className="w-5 h-5 text-brand-500 shrink-0" />
                  <span className="flex-1 text-left">
                    {serviceType
                      ? getServiceLabel(serviceType)
                      : '服务类型'}
                  </span>
                  <ChevronDown
                    className={cn(
                      'w-4 h-4 text-gray-400 transition-transform',
                      serviceTypeOpen && 'rotate-180'
                    )}
                  />
                </button>
                {serviceTypeOpen && (
                  <div className="absolute top-full mt-2 right-0 w-56 bg-white rounded-2xl shadow-card border border-gray-100 py-2 z-50 animate-fade-in">
                    {serviceTypeOptions.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => {
                          setServiceType(opt.value);
                          setServiceTypeOpen(false);
                        }}
                        className={cn(
                          'w-full px-4 py-2.5 text-sm text-left transition-colors',
                          serviceType === opt.value
                            ? 'bg-brand-50 text-brand-600 font-medium'
                            : 'text-gray-700 hover:bg-cream-50'
                        )}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <button
                onClick={() => setShowFilters(!showFilters)}
                className={cn(
                  'flex items-center justify-center gap-2 px-4 py-3 rounded-2xl text-sm font-medium transition-colors lg:hidden',
                  showFilters
                    ? 'bg-brand-500 text-white'
                    : 'bg-cream-50 text-gray-700 hover:bg-cream-100'
                )}
              >
                <SlidersHorizontal className="w-5 h-5" />
                筛选
              </button>
            </div>
          </div>
        </div>

        <div className="container mx-auto py-8">
          <div className="flex gap-8">
            {/* Left Filter Panel */}
            <aside
              className={cn(
                'w-72 shrink-0 transition-all duration-300',
                'lg:block',
                showFilters ? 'block' : 'hidden'
              )}
            >
              <div className="sticky top-[176px] space-y-6">
                <Card padding="lg">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-bold text-gray-900">筛选条件</h3>
                    <button
                      onClick={resetFilters}
                      className="text-sm text-brand-600 hover:text-brand-700 font-medium"
                    >
                      重置
                    </button>
                  </div>

                  {/* Price Range */}
                  <div className="mb-7">
                    <label className="block text-sm font-semibold text-gray-800 mb-4">
                      价格区间（元/天）
                    </label>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="flex-1">
                        <input
                          type="number"
                          value={minPrice}
                          onChange={(e) => setMinPrice(Number(e.target.value))}
                          min={0}
                          max={maxPrice}
                          className="w-full h-10 px-3 rounded-xl bg-cream-50 border border-gray-200 text-sm outline-none focus:border-brand-400 transition-colors"
                        />
                      </div>
                      <span className="text-gray-400">-</span>
                      <div className="flex-1">
                        <input
                          type="number"
                          value={maxPrice}
                          onChange={(e) => setMaxPrice(Number(e.target.value))}
                          min={minPrice}
                          className="w-full h-10 px-3 rounded-xl bg-cream-50 border border-gray-200 text-sm outline-none focus:border-brand-400 transition-colors"
                        />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <input
                        type="range"
                        min={0}
                        max={500}
                        value={minPrice}
                        onChange={(e) => setMinPrice(Number(e.target.value))}
                        className="w-full h-2 bg-gray-200 rounded-full appearance-none cursor-pointer accent-brand-500"
                      />
                      <input
                        type="range"
                        min={0}
                        max={500}
                        value={maxPrice}
                        onChange={(e) => setMaxPrice(Number(e.target.value))}
                        className="w-full h-2 bg-gray-200 rounded-full appearance-none cursor-pointer accent-brand-500"
                      />
                    </div>
                  </div>

                  {/* Pet Type */}
                  <div className="mb-7">
                    <label className="block text-sm font-semibold text-gray-800 mb-4">
                      宠物类型
                    </label>
                    <div className="space-y-2">
                      {petOptions.map((opt) => {
                        const Icon = opt.icon;
                        const checked = selectedPets.includes(opt.value);
                        return (
                          <button
                            key={opt.value}
                            onClick={() => togglePet(opt.value)}
                            className={cn(
                              'w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all',
                              checked
                                ? 'bg-brand-50 border-2 border-brand-400 text-brand-600'
                                : 'bg-cream-50 border-2 border-transparent text-gray-700 hover:bg-cream-100'
                            )}
                          >
                            <Icon
                              className={cn(
                                'w-5 h-5',
                                checked ? 'text-brand-500' : 'text-gray-400'
                              )}
                            />
                            <span className="text-sm font-medium">
                              {opt.label}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Distance */}
                  <div className="mb-7">
                    <label className="block text-sm font-semibold text-gray-800 mb-4">
                      距离范围
                      <span className="float-right text-brand-600 font-bold">
                        {maxDistance}km
                      </span>
                    </label>
                    <input
                      type="range"
                      min={1}
                      max={100}
                      value={maxDistance}
                      onChange={(e) => setMaxDistance(Number(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-full appearance-none cursor-pointer accent-brand-500"
                    />
                    <div className="flex justify-between mt-2 text-xs text-gray-400">
                      <span>1km</span>
                      <span>100km</span>
                    </div>
                  </div>

                  {/* Rating */}
                  <div className="mb-7">
                    <label className="block text-sm font-semibold text-gray-800 mb-4">
                      最低评分
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {[0, 3, 4, 4.5].map((rating) => (
                        <button
                          key={rating}
                          onClick={() => setMinRating(rating)}
                          className={cn(
                            'flex items-center justify-center gap-1 px-3 py-2.5 rounded-xl transition-all',
                            minRating === rating
                              ? 'bg-brand-500 text-white'
                              : 'bg-cream-50 text-gray-700 hover:bg-cream-100'
                          )}
                        >
                          {rating === 0 ? (
                            <span className="text-sm font-medium">全部</span>
                          ) : (
                            <>
                              <Star className="w-4 h-4 fill-current" />
                              <span className="text-sm font-medium">
                                {rating}+
                              </span>
                            </>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* More Filters */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-4">
                      更多筛选
                    </label>
                    <div className="space-y-3">
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={certifiedOnly}
                          onChange={(e) => setCertifiedOnly(e.target.checked)}
                          className="w-5 h-5 rounded-lg accent-brand-500 cursor-pointer"
                        />
                        <span className="text-sm text-gray-700">
                          仅显示认证商家
                        </span>
                      </label>
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={hasAvailability}
                          onChange={(e) => setHasAvailability(e.target.checked)}
                          className="w-5 h-5 rounded-lg accent-brand-500 cursor-pointer"
                        />
                        <span className="text-sm text-gray-700">
                          近期有空位
                        </span>
                      </label>
                    </div>
                  </div>
                </Card>
              </div>
            </aside>

            {/* Right Results Area */}
            <div className="flex-1 min-w-0">
              {/* Results Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                  <h2 className="text-xl md:text-2xl font-bold text-gray-900">
                    搜索结果
                    <span className="ml-2 text-base font-normal text-gray-500">
                      共 {filteredProviders.length} 家
                    </span>
                  </h2>
                </div>

                <div className="relative">
                  <button
                    onClick={() => setSortOpen(!sortOpen)}
                    className="flex items-center gap-2 px-4 py-2.5 bg-white rounded-xl border border-gray-200 text-sm text-gray-700 hover:border-brand-300 transition-colors shadow-sm"
                  >
                    <span className="text-gray-500">排序：</span>
                    <span className="font-medium text-gray-900">
                      {sortOptions.find((o) => o.value === sortBy)?.label}
                    </span>
                    <ChevronDown
                      className={cn(
                        'w-4 h-4 text-gray-400 transition-transform',
                        sortOpen && 'rotate-180'
                      )}
                    />
                  </button>
                  {sortOpen && (
                    <div className="absolute top-full mt-2 right-0 w-44 bg-white rounded-2xl shadow-card border border-gray-100 py-2 z-50 animate-fade-in">
                      {sortOptions.map((opt) => (
                        <button
                          key={opt.value}
                          onClick={() => {
                            setSortBy(opt.value as SortType);
                            setSortOpen(false);
                          }}
                          className={cn(
                            'w-full px-4 py-2.5 text-sm text-left transition-colors',
                            sortBy === opt.value
                              ? 'bg-brand-50 text-brand-600 font-medium'
                              : 'text-gray-700 hover:bg-cream-50'
                          )}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Active Filters */}
              {(selectedPets.length > 0 ||
                certifiedOnly ||
                hasAvailability ||
                minRating > 0 ||
                serviceType ||
                minPrice > 0 ||
                maxPrice < 500) && (
                <div className="flex flex-wrap gap-2 mb-6">
                  {serviceType && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-brand-50 text-brand-600 rounded-full text-sm">
                      {getServiceLabel(serviceType)}
                      <button
                        onClick={() => setServiceType('')}
                        className="hover:text-brand-800"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </span>
                  )}
                  {selectedPets.map((pet) => (
                    <span
                      key={pet}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-brand-50 text-brand-600 rounded-full text-sm"
                    >
                      {petOptions.find((o) => o.value === pet)?.label}
                      <button
                        onClick={() => togglePet(pet)}
                        className="hover:text-brand-800"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </span>
                  ))}
                  {(minPrice > 0 || maxPrice < 500) && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-brand-50 text-brand-600 rounded-full text-sm">
                      ¥{minPrice} - ¥{maxPrice}/天
                      <button
                        onClick={() => {
                          setMinPrice(0);
                          setMaxPrice(500);
                        }}
                        className="hover:text-brand-800"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </span>
                  )}
                  {minRating > 0 && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-brand-50 text-brand-600 rounded-full text-sm">
                      {minRating} 星以上
                      <button
                        onClick={() => setMinRating(0)}
                        className="hover:text-brand-800"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </span>
                  )}
                  {certifiedOnly && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-brand-50 text-brand-600 rounded-full text-sm">
                      认证商家
                      <button
                        onClick={() => setCertifiedOnly(false)}
                        className="hover:text-brand-800"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </span>
                  )}
                  {hasAvailability && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-brand-50 text-brand-600 rounded-full text-sm">
                      有空位
                      <button
                        onClick={() => setHasAvailability(false)}
                        className="hover:text-brand-800"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </span>
                  )}
                </div>
              )}

              {/* Results Grid */}
              {filteredProviders.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                  {filteredProviders.map((provider) => (
                    <ProviderCard key={provider.id} provider={provider} />
                  ))}
                </div>
              ) : (
                <Card padding="lg" className="text-center py-16">
                  <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-cream-100 flex items-center justify-center">
                    <Frown className="w-10 h-10 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    未找到符合条件的寄养服务
                  </h3>
                  <p className="text-gray-500 mb-6 max-w-md mx-auto">
                    请尝试调整筛选条件，或清除部分筛选选项来扩大搜索范围
                  </p>
                  <div className="flex items-center justify-center gap-3">
                    <Button variant="outline" onClick={resetFilters}>
                      重置筛选
                    </Button>
                    <Button
                      onClick={() => {
                        setKeyword('');
                        setServiceType('');
                        resetFilters();
                      }}
                    >
                      清除全部条件
                    </Button>
                  </div>
                </Card>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
