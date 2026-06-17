import { useState, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Check,
  ChevronRight,
  ChevronLeft,
  Building2,
  PawPrint,
  CalendarDays,
  Clock,
  ShieldCheck,
  Plus,
  Home as HomeIcon,
  Sun,
  Bed,
  AlertCircle,
} from 'lucide-react';
import { useAppStore, type CreateOrderData } from '@/store';
import type {
  Provider,
  Pet,
  Service,
  ServiceType,
  PetSpecies,
} from '@/types';
import Button from '@/components/common/Button';
import Input from '@/components/common/Input';
import ServiceCard from '@/components/provider/ServiceCard';
import DateTimePicker, {
  type TimeSlot,
} from '@/components/booking/DateTimePicker';
import PetForm, { type PetFormData } from '@/components/booking/PetForm';
import PriceBreakdown from '@/components/booking/PriceBreakdown';
import { formatCurrency, getServiceLabel, getServiceDailyPrice, getProviderName } from '@/utils/format';
import { toSafeProvider, getSafeServicePrice } from '@/utils/provider';
import { formatDate, getDaysBetween } from '@/utils/date';
import { cn } from '@/lib/utils';

type BookingStep = 1 | 2 | 3;
type PetSelectionMode = 'existing' | 'new';

interface SelectedRange {
  start?: string;
  end?: string;
}

const steps = [
  { id: 1, label: '宠物信息', icon: PawPrint },
  { id: 2, label: '日期时段', icon: CalendarDays },
  { id: 3, label: '确认支付', icon: ShieldCheck },
];

const serviceIconMap: Record<ServiceType, typeof Sun> = {
  daycare: Sun,
  home_visit: HomeIcon,
  boarding: Bed,
};

const speciesLabelMap: Record<PetSpecies, { label: string; emoji: string }> = {
  dog: { label: '狗狗', emoji: '🐕' },
  cat: { label: '猫咪', emoji: '🐱' },
  other: { label: '其他', emoji: '🐾' },
};

export default function Booking() {
  const { providerId } = useParams<{ providerId: string }>();
  const navigate = useNavigate();
  const providers = useAppStore((state) => state.providers);
  const pets = useAppStore((state) => state.pets);
  const currentUser = useAppStore((state) => state.currentUser);
  const createOrder = useAppStore((state) => state.createOrder);

  const provider = useMemo(
    () => providers.find((p) => p.id === providerId),
    [providers, providerId]
  );
  const safeProvider = useMemo(() => provider ? toSafeProvider(provider) : null, [provider]);
  const providerDisplayName = safeProvider?.displayName || '';

  const userPets = useMemo(() => {
    if (!currentUser) return [];
    return pets.filter((p) => p.ownerId === currentUser.id);
  }, [pets, currentUser]);

  const [currentStep, setCurrentStep] = useState<BookingStep>(1);
  const [petMode, setPetMode] = useState<PetSelectionMode>(
    userPets.length > 0 ? 'existing' : 'new'
  );
  const [selectedPetId, setSelectedPetId] = useState<string>(
    userPets[0]?.id || ''
  );
  const [newPetData, setNewPetData] = useState<PetFormData>({
    name: '',
    species: '',
    breed: '',
    age: '',
    weight: '',
    gender: '',
    vaccineRecords: [],
    notes: '',
  });

  const [selectedServiceId, setSelectedServiceId] = useState<string>(
    safeProvider?.services?.[0]?.id || ''
  );
  const [selectedRange, setSelectedRange] = useState<SelectedRange>({});
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot>('fullday');

  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [createdOrderId, setCreatedOrderId] = useState<string>('');

  const selectedService = useMemo(() => {
    return safeProvider?.services?.find((s: any) => s.id === selectedServiceId);
  }, [safeProvider, selectedServiceId]);

  const selectedPet = useMemo(() => {
    if (petMode === 'existing') {
      return userPets.find((p) => p.id === selectedPetId);
    }
    return undefined;
  }, [userPets, selectedPetId, petMode]);

  const daysCount = useMemo(() => {
    if (selectedRange.start && selectedRange.end) {
      return getDaysBetween(selectedRange.start, selectedRange.end);
    }
    return 0;
  }, [selectedRange]);

  const timeSlotLabelMap: Record<TimeSlot, string> = {
    morning: '上午 09:00 - 12:00',
    afternoon: '下午 14:00 - 18:00',
    fullday: '全天 09:00 - 18:00',
  };

  const isStep1Valid = useMemo(() => {
    if (petMode === 'existing') {
      return !!selectedPetId;
    }
    return (
      newPetData.name.trim() !== '' &&
      newPetData.species !== '' &&
      newPetData.breed.trim() !== ''
    );
  }, [petMode, selectedPetId, newPetData]);

  const isStep2Valid = useMemo(() => {
    return (
      !!selectedServiceId &&
      !!selectedRange.start &&
      !!selectedRange.end &&
      daysCount > 0 &&
      !!selectedSlot
    );
  }, [selectedServiceId, selectedRange, daysCount, selectedSlot]);

  const isStep3Valid = useMemo(() => {
    return isStep1Valid && isStep2Valid && agreedToTerms;
  }, [isStep1Valid, isStep2Valid, agreedToTerms]);

  const dailyPrice = useMemo(() => getServiceDailyPrice(selectedService), [selectedService]);

  const totalAmount = useMemo(() => {
    const serviceTotal = dailyPrice * Math.max(daysCount, 1);
    const platformFee = Math.round(serviceTotal * 0.05 * 100) / 100;
    return Math.round((serviceTotal + platformFee) * 100) / 100;
  }, [dailyPrice, daysCount]);

  const depositAmount = useMemo(() => {
    return Math.round(totalAmount * 0.3 * 100) / 100;
  }, [totalAmount]);

  const balanceAmount = useMemo(() => {
    return Math.round((totalAmount - depositAmount) * 100) / 100;
  }, [totalAmount, depositAmount]);

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

  const goToStep = (step: BookingStep) => {
    if (step === 2 && !isStep1Valid) return;
    if (step === 3 && !isStep2Valid) return;
    setCurrentStep(step);
    setSubmitError(null);
  };

  const handlePetFormChange = (data: Partial<PetFormData>) => {
    setNewPetData((prev) => ({ ...prev, ...data }));
  };

  const handleSubmitOrder = async () => {
    if (!isStep3Valid) return;
    if (!currentUser) {
      setSubmitError('请先登录后再下单');
      return;
    }
    if (!selectedService || !selectedRange.start || !selectedRange.end) {
      setSubmitError('请完善预约信息');
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      let finalPetId = selectedPet?.id;
      if (petMode === 'new') {
        finalPetId = 'pet_new_' + Date.now();
      }

      if (!finalPetId) {
        throw new Error('请选择或填写宠物信息');
      }

      const orderData: CreateOrderData = {
        ownerId: currentUser.id,
        providerId: safeProvider?.id || provider.id,
        petId: finalPetId,
        serviceId: selectedService.id,
        serviceType: selectedService.type,
        startDate: selectedRange.start,
        endDate: selectedRange.end,
        timeSlot: selectedSlot,
        totalAmount,
        depositAmount,
        balanceAmount,
      };

      await new Promise((resolve) => setTimeout(resolve, 1000));

      const newOrder = createOrder({
        ...orderData,
        totalPrice: totalAmount,
        deposit: depositAmount,
      } as any);

      setCreatedOrderId(newOrder.id);
      setShowSuccess(true);
      setIsSubmitting(false);

      setTimeout(() => {
        navigate(`/orders/${newOrder.id}`);
      }, 2500);
    } catch (err) {
      setIsSubmitting(false);
      setSubmitError(
        err instanceof Error ? err.message : '订单创建失败，请稍后重试'
      );
    }
  };

  const StepIndicator = () => (
    <div className="mb-8">
      <div className="flex items-center justify-center">
        {steps.map((step, index) => {
          const Icon = step.icon;
          const isActive = currentStep === step.id;
          const isCompleted = currentStep > step.id;

          return (
            <div key={step.id} className="flex items-center">
              <button
                onClick={() => isCompleted && goToStep(step.id as BookingStep)}
                disabled={!isCompleted && !isActive}
                className={cn(
                  'flex flex-col items-center group',
                  isCompleted && 'cursor-pointer'
                )}
              >
                <div
                  className={cn(
                    'relative flex h-12 w-12 items-center justify-center rounded-2xl font-semibold text-base transition-all duration-300',
                    isCompleted
                      ? 'bg-brand-500 text-white shadow-lg'
                      : isActive
                      ? 'bg-brand-100 text-brand-700 ring-4 ring-brand-50'
                      : 'bg-gray-100 text-gray-400'
                  )}
                >
                  {isCompleted ? (
                    <Check className="h-6 w-6" />
                  ) : (
                    <Icon className="h-6 w-6" />
                  )}
                </div>
                <span
                  className={cn(
                    'mt-2 text-sm font-medium transition-colors',
                    isCompleted || isActive
                      ? 'text-gray-900'
                      : 'text-gray-400'
                  )}
                >
                  {step.label}
                </span>
                <span
                  className={cn(
                    'text-xs mt-0.5',
                    isActive ? 'text-brand-600' : 'text-transparent'
                  )}
                >
                  步骤 {step.id}
                </span>
              </button>

              {index < steps.length - 1 && (
                <div className="mx-4 mb-8 flex w-16 sm:w-24 items-center">
                  <div
                    className={cn(
                      'h-1 w-full rounded-full transition-colors duration-300',
                      isCompleted ? 'bg-brand-500' : 'bg-gray-200'
                    )}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-3xl shadow-soft border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-5">
          选择宠物
        </h3>

        <div className="flex gap-3 mb-6">
          <button
            onClick={() => setPetMode('existing')}
            disabled={userPets.length === 0}
            className={cn(
              'flex-1 py-3 px-4 rounded-2xl border-2 font-medium text-sm transition-all duration-200',
              userPets.length === 0
                ? 'opacity-50 cursor-not-allowed border-gray-100 bg-gray-50 text-gray-400'
                : petMode === 'existing'
                ? 'border-brand-500 bg-brand-50 text-brand-700'
                : 'border-gray-100 bg-white text-gray-600 hover:border-gray-200'
            )}
          >
            选择已有宠物
            {userPets.length > 0 && (
              <span className="ml-1.5 text-xs opacity-70">
                ({userPets.length}只)
              </span>
            )}
          </button>
          <button
            onClick={() => setPetMode('new')}
            className={cn(
              'flex-1 py-3 px-4 rounded-2xl border-2 font-medium text-sm transition-all duration-200 flex items-center justify-center gap-1.5',
              petMode === 'new'
                ? 'border-brand-500 bg-brand-50 text-brand-700'
                : 'border-gray-100 bg-white text-gray-600 hover:border-gray-200'
            )}
          >
            <Plus className="w-4 h-4" />
            添加新宠物
          </button>
        </div>

        {petMode === 'existing' && userPets.length > 0 && (
          <div className="grid gap-3 sm:grid-cols-2">
            {userPets.map((pet) => {
              const info = speciesLabelMap[pet.species];
              const isSelected = selectedPetId === pet.id;
              return (
                <button
                  key={pet.id}
                  onClick={() => setSelectedPetId(pet.id)}
                  className={cn(
                    'relative p-4 rounded-2xl border-2 text-left transition-all duration-200',
                    isSelected
                      ? 'border-brand-500 bg-brand-50 shadow-float'
                      : 'border-gray-100 bg-white hover:border-gray-200 hover:shadow-soft'
                  )}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-cream-100 flex items-center justify-center shrink-0 text-2xl">
                      {info.emoji}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold text-gray-900">
                          {pet.name}
                        </h4>
                        {isSelected && (
                          <div className="h-5 w-5 rounded-full bg-brand-500 flex items-center justify-center shrink-0">
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
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-md">
                          {info.label}
                        </span>
                        <span className="text-xs text-gray-500">
                          {pet.breed}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-2 line-clamp-1">
                        {pet.notes || '暂无备注'}
                      </p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {petMode === 'new' && (
          <PetForm formData={newPetData} onChange={handlePetFormChange} />
        )}
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-3xl shadow-soft border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-5">
          选择服务类型
        </h3>
        <div className="space-y-4">
          {safeProvider?.services?.map((service: any) => {
            const Icon = serviceIconMap[service.type];
            const isSelected = selectedServiceId === service.id;
            return (
              <div
                key={service.id}
                onClick={() => setSelectedServiceId(service.id)}
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
      </div>

      <div className="bg-white rounded-3xl shadow-soft border border-gray-100 p-6">
        <DateTimePicker
          provider={provider as any}
          startDate={selectedRange.start}
          endDate={selectedRange.end}
          onDateChange={setSelectedRange}
          selectedSlot={selectedSlot}
          onSlotChange={setSelectedSlot}
        />
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-3xl shadow-soft border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-5">
          订单摘要
        </h3>

        <div className="space-y-4">
          <div className="flex items-start gap-3 p-4 rounded-2xl bg-gray-50">
            <div className="w-10 h-10 rounded-xl bg-brand-100 text-brand-600 flex items-center justify-center shrink-0">
              <Building2 className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs text-gray-500 mb-0.5">商家</div>
              <div className="font-semibold text-gray-900">
                {providerDisplayName}
              </div>
              <div className="text-xs text-gray-500 mt-1 line-clamp-1">
                {safeProvider?.address}
              </div>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex items-start gap-3 p-4 rounded-2xl bg-gray-50">
              <div className="w-10 h-10 rounded-xl bg-forest-100 text-forest-600 flex items-center justify-center shrink-0">
                <PawPrint className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs text-gray-500 mb-0.5">宠物信息</div>
                {petMode === 'existing' && selectedPet ? (
                  <>
                    <div className="font-semibold text-gray-900">
                      {selectedPet.name}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {speciesLabelMap[selectedPet.species].label} · {selectedPet.breed}
                    </div>
                  </>
                ) : (
                  <>
                    <div className="font-semibold text-gray-900">
                      {newPetData.name || '未填写'}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {newPetData.species
                        ? speciesLabelMap[newPetData.species as PetSpecies].label
                        : '未选择'}{' '}
                      · {newPetData.breed || '未填写'}
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 rounded-2xl bg-gray-50">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
                {selectedService && serviceIconMap[selectedService.type] && (
                  (() => {
                    const Icon = serviceIconMap[selectedService.type];
                    return <Icon className="w-5 h-5" />;
                  })()
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs text-gray-500 mb-0.5">服务类型</div>
                <div className="font-semibold text-gray-900">
                  {selectedService
                    ? getServiceLabel(selectedService.type)
                    : '未选择'}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {selectedService
                    ? formatCurrency(dailyPrice) + '/天'
                    : ''}
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex items-start gap-3 p-4 rounded-2xl bg-gray-50">
              <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-600 flex items-center justify-center shrink-0">
                <CalendarDays className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs text-gray-500 mb-0.5">服务日期</div>
                {selectedRange.start && selectedRange.end ? (
                  <>
                    <div className="font-semibold text-gray-900">
                      {formatDate(selectedRange.start, 'MM月dd日')} ~{' '}
                      {formatDate(selectedRange.end, 'MM月dd日')}
                    </div>
                    <div className="text-xs text-brand-600 mt-1 font-medium">
                      共 {daysCount} 天
                    </div>
                  </>
                ) : (
                  <div className="font-semibold text-gray-400">未选择</div>
                )}
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 rounded-2xl bg-gray-50">
              <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center shrink-0">
                <Clock className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs text-gray-500 mb-0.5">服务时段</div>
                <div className="font-semibold text-gray-900">
                  {timeSlotLabelMap[selectedSlot]}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {selectedService && (
        <PriceBreakdown
          dailyPrice={dailyPrice}
          daysCount={Math.max(daysCount, 1)}
          serviceType={selectedService.type}
        />
      )}

      <div className="bg-white rounded-3xl shadow-soft border border-gray-100 p-6">
        <label className="flex items-start gap-3 cursor-pointer group">
          <div
            onClick={() => setAgreedToTerms(!agreedToTerms)}
            className={cn(
              'mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 transition-all duration-200',
              agreedToTerms
                ? 'bg-brand-500 border-brand-500'
                : 'border-gray-300 group-hover:border-brand-400'
            )}
          >
            {agreedToTerms && (
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
            )}
          </div>
          <div className="text-sm text-gray-600 leading-relaxed">
            我已阅读并同意
            <a
              href="#"
              className="text-brand-600 hover:text-brand-700 font-medium mx-1"
            >
              《服务协议》
            </a>
            和
            <a
              href="#"
              className="text-brand-600 hover:text-brand-700 font-medium mx-1"
            >
              《宠物托管安全须知》
            </a>
            ，确认以上信息准确无误。
          </div>
        </label>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 pb-28 md:pb-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
          <Link
            to="/"
            className="hover:text-brand-600 transition-colors"
          >
            首页
          </Link>
          <ChevronRight className="w-4 h-4" />
          <Link
            to={`/providers/${provider.id}`}
            className="hover:text-brand-600 transition-colors truncate"
          >
            {providerDisplayName}
          </Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-gray-900 font-medium">预约下单</span>
        </nav>

        <div className="bg-white rounded-3xl shadow-soft border border-gray-100 p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-11 h-11 rounded-2xl bg-brand-100 text-brand-600 flex items-center justify-center">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                预约下单
              </h1>
              <p className="text-sm text-gray-500 mt-0.5">
                预约「{providerDisplayName}」的宠物服务
              </p>
            </div>
          </div>
        </div>

        <StepIndicator />

        {showSuccess ? (
          <div className="bg-white rounded-3xl shadow-soft border border-gray-100 p-10 text-center animate-fade-in-up">
            <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-5">
              <Check className="w-10 h-10 text-green-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              订单提交成功！
            </h3>
            <p className="text-gray-500 mb-4">
              订单号已生成，请等待商家确认
            </p>
            {createdOrderId && (
              <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-brand-50 border border-brand-200 text-brand-700 font-mono font-semibold mb-6">
                <span className="text-sm text-brand-600">订单号：</span>
                <span>PB{createdOrderId.slice(-10)}</span>
              </div>
            )}
            <p className="text-sm text-gray-400">
              正在跳转到订单详情页...
            </p>
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-12">
            <div className="lg:col-span-8 space-y-6">
              {currentStep === 1 && renderStep1()}
              {currentStep === 2 && renderStep2()}
              {currentStep === 3 && renderStep3()}
            </div>

            <div className="lg:col-span-4">
              <div className="lg:sticky lg:top-6 space-y-4">
                <div className="bg-white rounded-3xl shadow-soft border border-gray-100 p-5">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    费用明细
                  </h3>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between py-2">
                      <span className="text-sm text-gray-600">
                        服务类型
                      </span>
                      <span className="text-sm font-medium text-gray-900">
                        {selectedService
                          ? getServiceLabel(selectedService.type)
                          : '未选择'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between py-2">
                      <span className="text-sm text-gray-600">
                        服务天数
                      </span>
                      <span className="text-sm font-medium text-gray-900">
                        {daysCount > 0 ? `${daysCount} 天` : '未选择'}
                      </span>
                    </div>
                    {selectedService && daysCount > 0 && (
                      <div className="flex items-center justify-between py-2">
                        <span className="text-sm text-gray-600">
                          服务小计
                        </span>
                        <span className="text-sm font-medium text-gray-900 tabular-nums">
                          {formatCurrency(dailyPrice)} × {daysCount}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="my-4 border-t border-dashed border-gray-200" />

                  <div className="flex items-center justify-between py-2">
                    <span className="text-base font-semibold text-gray-900">
                      应付总额
                    </span>
                    <span className="text-2xl font-bold text-brand-600 tabular-nums">
                      {formatCurrency(totalAmount)}
                    </span>
                  </div>

                  <div className="mt-4 rounded-2xl bg-gradient-to-br from-brand-50 to-petal-50 p-4 border border-brand-100">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <div className="text-xs text-gray-500">
                          立即支付定金 (30%)
                        </div>
                        <div className="text-xl font-bold text-brand-600 tabular-nums">
                          {formatCurrency(depositAmount)}
                        </div>
                      </div>
                      <div className="h-10 w-px bg-brand-200" />
                      <div className="space-y-0.5 text-right">
                        <div className="text-xs text-gray-500">
                          服务后付尾款
                        </div>
                        <div className="text-lg font-bold text-gray-700 tabular-nums">
                          {formatCurrency(balanceAmount)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {submitError && (
                  <div className="rounded-2xl bg-red-50 border border-red-200 p-4 flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                    <p className="text-sm text-red-700">{submitError}</p>
                  </div>
                )}

                <div className="flex gap-3">
                  {currentStep > 1 && (
                    <Button
                      variant="outline"
                      size="lg"
                      onClick={() =>
                        goToStep((currentStep - 1) as BookingStep)
                      }
                    >
                      <ChevronLeft className="w-4 h-4" />
                      上一步
                    </Button>
                  )}

                  {currentStep < 3 ? (
                    <Button
                      fullWidth
                      size="lg"
                      onClick={() =>
                        goToStep((currentStep + 1) as BookingStep)
                      }
                      disabled={
                        (currentStep === 1 && !isStep1Valid) ||
                        (currentStep === 2 && !isStep2Valid)
                      }
                    >
                      下一步
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  ) : (
                    <Button
                      fullWidth
                      size="lg"
                      onClick={handleSubmitOrder}
                      loading={isSubmitting}
                      disabled={!isStep3Valid || isSubmitting}
                    >
                      <ShieldCheck className="w-4 h-4" />
                      {isSubmitting
                        ? '提交中...'
                        : `支付定金 ${formatCurrency(depositAmount)}`}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="fixed bottom-0 left-0 right-0 z-40 lg:hidden">
        <div className="bg-white border-t border-gray-200 px-4 py-3 safe-area-inset-bottom">
          <div className="flex items-center gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1">
                <span className="text-xs text-gray-500">应付</span>
                <span className="text-2xl font-bold text-brand-600 tabular-nums">
                  {formatCurrency(currentStep === 3 ? depositAmount : totalAmount)}
                </span>
              </div>
              {currentStep === 3 && (
                <div className="text-xs text-gray-400">定金 (30%)</div>
              )}
            </div>

            {currentStep > 1 && (
              <button
                onClick={() => goToStep((currentStep - 1) as BookingStep)}
                className="flex items-center justify-center w-12 h-12 rounded-xl border-2 border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
            )}

            {currentStep < 3 ? (
              <Button
                size="lg"
                onClick={() => goToStep((currentStep + 1) as BookingStep)}
                disabled={
                  (currentStep === 1 && !isStep1Valid) ||
                  (currentStep === 2 && !isStep2Valid)
                }
                className="flex-1"
              >
                下一步
              </Button>
            ) : (
              <Button
                size="lg"
                onClick={handleSubmitOrder}
                loading={isSubmitting}
                disabled={!isStep3Valid || isSubmitting}
                className="flex-1"
              >
                {isSubmitting ? '提交中...' : '提交订单'}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
