import { useState, useMemo } from 'react';
import {
  Settings,
  Store,
  CalendarClock,
  PawPrint,
  Image as ImageIcon,
  Shield,
  CheckCircle2,
  Upload,
  X,
  GripVertical,
  Eye,
  EyeOff,
  Save,
  Phone,
  MapPin,
  Clock,
  FileText,
  AlertCircle,
  Lock,
  Trash2,
  Plus,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/store';
import ProviderSidebar from '@/components/layout/ProviderSidebar';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';
import Input from '@/components/common/Input';
import Avatar from '@/components/common/Avatar';
import type { ServiceType, PetSpecies, Service, EnvPhoto } from '@/types';
import { getServiceLabel, getProviderName, normalizeAcceptedPets, getServiceDailyPrice } from '@/utils/format';
import { toSafeProvider, getSafeServicePrice } from '@/utils/provider';

type SettingsTab = 'basic' | 'service' | 'pet' | 'photos' | 'security';

const TABS: {
  id: SettingsTab;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  { id: 'basic', label: '基本信息', icon: Store },
  { id: 'service', label: '服务配置', icon: CalendarClock },
  { id: 'pet', label: '宠物配置', icon: PawPrint },
  { id: 'photos', label: '环境照片', icon: ImageIcon },
  { id: 'security', label: '账号安全', icon: Shield },
];

const SERVICE_TYPES: ServiceType[] = ['daycare', 'home_visit', 'boarding'];

const SPECIES_OPTIONS: { id: PetSpecies; label: string }[] = [
  { id: 'dog', label: '狗狗' },
  { id: 'cat', label: '猫咪' },
  { id: 'other', label: '其他' },
];

const PHOTO_PLACEHOLDERS = [
  'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=600&q=80',
  'https://images.unsplash.com/photo-1558788353-f76d92427f16?w=600&q=80',
  'https://images.unsplash.com/photo-1560743641-3914f2c45636?w=600&q=80',
  'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=600&q=80',
  'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=600&q=80',
];

export default function DashboardSettings() {
  const { providers, users, currentUser, updateProvider } = useAppStore();
  const [activeTab, setActiveTab] = useState<SettingsTab>('basic');
  const [showSuccess, setShowSuccess] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const rawProvider = useMemo(() => {
    return providers.find(p => p.userId === currentUser?.id) || providers[0];
  }, [providers, currentUser]);
  const safeProvider = useMemo(() => rawProvider ? toSafeProvider(rawProvider) : null, [rawProvider]);

  const providerUser = useMemo(() => {
    return users.find((u) => u.id === safeProvider?.userId);
  }, [users, safeProvider]);

  const [basicInfo, setBasicInfo] = useState({
    businessName: safeProvider?.displayName || '',
    address: safeProvider?.address || '',
    city: safeProvider?.city || '',
    openTime: '08:00',
    closeTime: '20:00',
    phone: (providerUser as any)?.phone || '',
    email: providerUser?.email || '',
    description: safeProvider?.description || '',
  });

  const [serviceConfig, setServiceConfig] = useState(
    SERVICE_TYPES.map((type) => {
      const service = safeProvider?.services?.find((s: any) => s.type === type);
      return {
        type,
        enabled: !!service,
        price: service ? getServiceDailyPrice(service) : 0,
        description: service?.description || '',
      };
    })
  );

  const petCfg = normalizeAcceptedPets(safeProvider?.acceptedPets);
  const [petConfig, setPetConfig] = useState({
    acceptedSpecies: petCfg.species as PetSpecies[],
    maxPets: petCfg.maxCount,
    breedRestriction: petCfg.breedRestrictions.join('、'),
  });

  const [photos, setPhotos] = useState(
    safeProvider?.photos?.map((p, idx) => ({
      ...p,
      caption: p.caption || `环境照片 ${idx + 1}`,
    })) || []
  );

  const [security, setSecurity] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    showCurrent: false,
    showNew: false,
    showConfirm: false,
  });

  const handleSave = async () => {
    setIsSaving(true);
    await new Promise(r => setTimeout(r, 800));

    const servicesToSave: Service[] = serviceConfig
      .filter(s => s.enabled)
      .map((s, idx) => ({
        id: `service_${Date.now()}_${idx}`,
        providerId: safeProvider?.id || '',
        type: s.type,
        description: s.description,
        dailyPrice: s.price,
        pricePerDay: s.price,
      }));

    const acceptedPetsToSave = {
      species: petConfig.acceptedSpecies,
      maxCount: petConfig.maxPets,
      maxPets: petConfig.maxPets,
      breedRestrictions: petConfig.breedRestriction ? petConfig.breedRestriction.split(/[、,，]/).map(s => s.trim()).filter(Boolean) : [],
      acceptedSpecies: petConfig.acceptedSpecies,
    };

    if (safeProvider?.id) {
      updateProvider(safeProvider.id, {
        businessName: basicInfo.businessName,
        name: basicInfo.businessName,
        address: basicInfo.address,
        city: basicInfo.city,
        businessHours: `${basicInfo.openTime} - ${basicInfo.closeTime}`,
        description: basicInfo.description,
        services: servicesToSave,
        acceptedPets: acceptedPetsToSave,
        photos: photos.map((p, idx) => ({
          id: p.id,
          providerId: safeProvider.id,
          url: p.url,
          caption: p.caption,
          sortOrder: idx,
          uploadedAt: p.uploadedAt || new Date().toISOString(),
        })),
      });
    }

    setIsSaving(false);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const toggleService = (index: number) => {
    setServiceConfig(
      serviceConfig.map((s, i) =>
        i === index ? { ...s, enabled: !s.enabled } : s
      )
    );
  };

  const updateServicePrice = (index: number, price: number) => {
    setServiceConfig(
      serviceConfig.map((s, i) => (i === index ? { ...s, price } : s))
    );
  };

  const updateServiceDesc = (index: number, description: string) => {
    setServiceConfig(
      serviceConfig.map((s, i) => (i === index ? { ...s, description } : s))
    );
  };

  const toggleSpecies = (species: PetSpecies) => {
    setPetConfig((prev) => ({
      ...prev,
      acceptedSpecies: prev.acceptedSpecies.includes(species)
        ? prev.acceptedSpecies.filter((s) => s !== species)
        : [...prev.acceptedSpecies, species],
    }));
  };

  const addPhoto = () => {
    const newIdx = photos.length;
    setPhotos([
      ...photos,
      {
        id: `photo_new_${Date.now()}`,
        providerId: safeProvider?.id || '',
        url: PHOTO_PLACEHOLDERS[newIdx % PHOTO_PLACEHOLDERS.length],
        caption: `环境照片 ${newIdx + 1}`,
        uploadedAt: new Date().toISOString(),
      },
    ]);
  };

  const removePhoto = (id: string) => {
    setPhotos(photos.filter((p) => p.id !== id));
  };

  const updatePhotoCaption = (id: string, caption: string) => {
    setPhotos(photos.map((p) => (p.id === id ? { ...p, caption } : p)));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream-50/30 via-white to-petal-50/20 flex">
      <ProviderSidebar />

      <main className="flex-1 min-w-0 p-6 md:p-8 overflow-auto">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-gray-100 to-slate-100 flex items-center justify-center">
                <Settings className="w-6 h-6 text-gray-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">商家设置</h1>
                <p className="text-sm text-gray-500">管理店铺信息和服务配置</p>
              </div>
            </div>

            <Button
              loading={isSaving}
              disabled={isSaving}
              icon={<Save className="w-4 h-4" />}
              onClick={handleSave}
            >
              保存设置
            </Button>
          </div>

          <Card padding="none" className="overflow-hidden">
            <div className="flex border-b border-gray-100 overflow-x-auto">
              {TABS.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={cn(
                      'flex items-center gap-2 px-6 py-4 whitespace-nowrap',
                      'text-sm font-medium transition-all duration-200 relative',
                      isActive
                        ? 'text-brand-600 bg-brand-50/40'
                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50/50'
                    )}
                  >
                    <Icon className={cn('w-4 h-4', isActive ? 'text-brand-500' : '')} />
                    {tab.label}
                    {isActive && (
                      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-500 rounded-t" />
                    )}
                  </button>
                );
              })}
            </div>

            <div className="p-6 md:p-8">
              {activeTab === 'basic' && (
                <div className="max-w-2xl space-y-6 animate-fade-in">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 mb-1">基本信息</h2>
                    <p className="text-sm text-gray-500">更新您的店铺基础信息</p>
                  </div>

                  <div className="flex items-center gap-5 p-5 rounded-2xl bg-gradient-to-r from-cream-50/70 to-brand-50/50 border border-brand-100/50">
                    <Avatar
                      size="xl"
                      src={(providerUser as any)?.avatar}
                      name={basicInfo.businessName}
                      className="border-4 border-white shadow-card"
                    />
                    <div>
                      <div className="text-base font-semibold text-gray-900 mb-2">
                        {basicInfo.businessName}
                      </div>
                      <Button size="sm" variant="outline">
                        更换头像
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="md:col-span-2">
                      <Input
                        label="商家名称"
                        value={basicInfo.businessName}
                        onChange={(v) => setBasicInfo({ ...basicInfo, businessName: v })}
                        prefixIcon={<Store className="w-4 h-4" />}
                      />
                    </div>
                    <div className="md:col-span-2">
                      <Input
                        label="所在城市"
                        value={basicInfo.city}
                        onChange={(v) => setBasicInfo({ ...basicInfo, city: v })}
                        prefixIcon={<MapPin className="w-4 h-4" />}
                      />
                    </div>
                    <div className="md:col-span-2">
                      <Input
                        label="详细地址"
                        value={basicInfo.address}
                        onChange={(v) => setBasicInfo({ ...basicInfo, address: v })}
                        prefixIcon={<MapPin className="w-4 h-4" />}
                      />
                    </div>
                    <div>
                      <Input
                        label="联系电话"
                        value={basicInfo.phone}
                        onChange={(v) => setBasicInfo({ ...basicInfo, phone: v })}
                        prefixIcon={<Phone className="w-4 h-4" />}
                      />
                    </div>
                    <div>
                      <Input
                        label="电子邮箱"
                        value={basicInfo.email}
                        onChange={(v) => setBasicInfo({ ...basicInfo, email: v })}
                        prefixIcon={<FileText className="w-4 h-4" />}
                      />
                    </div>
                    <div>
                      <Input
                        label="开始营业时间"
                        type="time"
                        value={basicInfo.openTime}
                        onChange={(v) => setBasicInfo({ ...basicInfo, openTime: v })}
                        prefixIcon={<Clock className="w-4 h-4" />}
                      />
                    </div>
                    <div>
                      <Input
                        label="结束营业时间"
                        type="time"
                        value={basicInfo.closeTime}
                        onChange={(v) => setBasicInfo({ ...basicInfo, closeTime: v })}
                        prefixIcon={<Clock className="w-4 h-4" />}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      商家介绍
                    </label>
                    <textarea
                      value={basicInfo.description}
                      onChange={(e) => setBasicInfo({ ...basicInfo, description: e.target.value })}
                      placeholder="介绍一下您的寄养服务特色、环境设施、团队经验等..."
                      className="w-full h-36 px-4 py-3 rounded-xl border border-gray-200 bg-gray-50/50 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-brand-200 focus:border-brand-300 transition-all placeholder:text-gray-400 leading-relaxed"
                      maxLength={1000}
                    />
                    <div className="flex justify-end mt-2">
                      <span className="text-xs text-gray-400">{basicInfo.description.length}/1000</span>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'service' && (
                <div className="max-w-3xl space-y-6 animate-fade-in">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 mb-1">服务配置</h2>
                    <p className="text-sm text-gray-500">开启/关闭服务类型，设置价格和描述</p>
                  </div>

                  <div className="space-y-5">
                    {serviceConfig.map((svc, idx) => {
                      return (
                        <div
                          key={svc.type}
                          className={cn(
                            'rounded-2xl border-2 transition-all duration-300 overflow-hidden',
                            svc.enabled
                              ? 'border-brand-200 bg-gradient-to-br from-brand-50/30 via-white to-cream-50/30'
                              : 'border-gray-100 bg-gray-50/50 opacity-70'
                          )}
                        >
                          <div className="flex items-center justify-between gap-4 p-5 border-b border-gray-100/70">
                            <div className="flex items-center gap-3">
                              <div
                                className={cn(
                                  'w-11 h-11 rounded-xl flex items-center justify-center',
                                  svc.enabled
                                    ? 'bg-gradient-to-br from-brand-500 to-brand-400 text-white shadow-float'
                                    : 'bg-gray-200 text-gray-500'
                                )}
                              >
                                <CalendarClock className="w-5 h-5" />
                              </div>
                              <div>
                                <h3 className="text-base font-semibold text-gray-900">
                                  {getServiceLabel(svc.type)}
                                </h3>
                                <p className="text-xs text-gray-500 mt-0.5">
                                  {svc.enabled ? '已启用 · 客户可下单' : '已关闭 · 暂不接受'}
                                </p>
                              </div>
                            </div>

                            <button
                              onClick={() => toggleService(idx)}
                              className={cn(
                                'relative w-14 h-8 rounded-full transition-all duration-300 shrink-0',
                                svc.enabled ? 'bg-brand-500' : 'bg-gray-300'
                              )}
                            >
                              <div
                                className={cn(
                                  'absolute top-0.5 w-7 h-7 rounded-full bg-white shadow-md transition-all duration-300',
                                  svc.enabled ? 'left-[26px]' : 'left-0.5'
                                )}
                              />
                            </button>
                          </div>

                          <div className={cn('p-5 space-y-5', !svc.enabled && 'opacity-50 pointer-events-none')}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                              <div>
                                <Input
                                  label="每日价格 (元/天)"
                                  type="number"
                                  value={svc.price}
                                  onChange={(v) => updateServicePrice(idx, Number(v))}
                                  prefixIcon={<span className="text-brand-500 font-semibold text-sm">¥</span>}
                                />
                              </div>
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                服务描述
                              </label>
                              <textarea
                                value={svc.description}
                                onChange={(e) => updateServiceDesc(idx, e.target.value)}
                                placeholder="描述这项服务的具体内容、包含项目、注意事项等..."
                                className="w-full h-24 px-4 py-3 rounded-xl border border-gray-200 bg-white text-sm resize-none focus:outline-none focus:ring-2 focus:ring-brand-200 focus:border-brand-300 transition-all placeholder:text-gray-400 leading-relaxed"
                              />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {activeTab === 'pet' && (
                <div className="max-w-2xl space-y-6 animate-fade-in">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 mb-1">宠物配置</h2>
                    <p className="text-sm text-gray-500">设置可接待的宠物类型和数量上限</p>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        可接待宠物类型
                      </label>
                      <div className="grid grid-cols-3 gap-3">
                        {SPECIES_OPTIONS.map((opt) => {
                          const isSelected = petConfig.acceptedSpecies.includes(opt.id);
                          return (
                            <button
                              key={opt.id}
                              onClick={() => toggleSpecies(opt.id)}
                              className={cn(
                                'p-4 rounded-2xl border-2 transition-all duration-200 text-center',
                                isSelected
                                  ? 'border-brand-400 bg-brand-50/60 shadow-soft'
                                  : 'border-gray-100 bg-gray-50/50 hover:border-gray-200 hover:bg-white'
                              )}
                            >
                              <div
                                className={cn(
                                  'w-12 h-12 mx-auto mb-2 rounded-xl flex items-center justify-center',
                                  isSelected ? 'bg-brand-500 text-white' : 'bg-gray-200 text-gray-500'
                                )}
                              >
                                <PawPrint className="w-6 h-6" />
                              </div>
                              <div
                                className={cn(
                                  'text-sm font-semibold',
                                  isSelected ? 'text-brand-700' : 'text-gray-700'
                                )}
                              >
                                {opt.label}
                              </div>
                              {isSelected && (
                                <div className="mt-2 flex items-center justify-center gap-1 text-xs text-brand-600">
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                  已选
                                </div>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="max-w-xs">
                      <Input
                        label="同时可接待宠物数量上限"
                        type="number"
                        value={petConfig.maxPets}
                        onChange={(v) => setPetConfig({ ...petConfig, maxPets: Number(v) })}
                        prefixIcon={<PawPrint className="w-4 h-4" />}
                        helperText="请根据您的实际接待能力设置"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        品种限制（可选）
                      </label>
                      <textarea
                        value={petConfig.breedRestriction}
                        onChange={(e) => setPetConfig({ ...petConfig, breedRestriction: e.target.value })}
                        placeholder="例如：不接待烈性犬、大型犬等，如无特殊限制可留空..."
                        className="w-full h-24 px-4 py-3 rounded-xl border border-gray-200 bg-gray-50/50 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-brand-200 focus:border-brand-300 transition-all placeholder:text-gray-400 leading-relaxed"
                      />
                      <div className="flex items-start gap-1.5 mt-2 text-xs text-amber-600">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                        <span>填写特殊限制说明，帮助客户做出正确选择</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'photos' && (
                <div className="space-y-6 animate-fade-in">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h2 className="text-lg font-semibold text-gray-900 mb-1">环境照片</h2>
                      <p className="text-sm text-gray-500">
                        上传店铺环境照片，让客户更了解您的服务空间（最多20张）
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      icon={<Plus className="w-4 h-4" />}
                      onClick={addPhoto}
                      disabled={photos.length >= 20}
                    >
                      添加照片
                    </Button>
                  </div>

                  {photos.length === 0 ? (
                    <div
                      onClick={addPhoto}
                      className="h-64 rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50/50 hover:border-brand-300 hover:bg-brand-50/30 transition-all cursor-pointer flex flex-col items-center justify-center gap-3 group"
                    >
                      <div className="w-16 h-16 rounded-2xl bg-white shadow-soft flex items-center justify-center group-hover:scale-105 transition-transform">
                        <Upload className="w-8 h-8 text-brand-400" />
                      </div>
                      <div className="text-center">
                        <div className="text-base font-semibold text-gray-700 mb-0.5">点击或拖拽上传照片</div>
                        <div className="text-sm text-gray-400">支持 JPG/PNG 格式，单张不超过 5MB</div>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                      {photos.map((photo, idx) => (
                        <div
                          key={photo.id}
                          className="group relative rounded-2xl overflow-hidden border border-gray-100 bg-white shadow-soft hover:shadow-card hover:border-brand-200 transition-all duration-300"
                        >
                          <div className="relative aspect-[4/3] bg-gray-100">
                            <img
                              src={photo.url}
                              alt={photo.caption}
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute top-3 left-3 w-7 h-7 rounded-lg bg-black/50 backdrop-blur-sm flex items-center justify-center text-white text-xs font-semibold">
                              {idx + 1}
                            </div>
                            <div className="absolute top-3 right-3 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button className="w-8 h-8 rounded-lg bg-white/90 backdrop-blur-sm flex items-center justify-center text-gray-600 hover:bg-white hover:text-gray-800 transition-colors">
                                <GripVertical className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => removePhoto(photo.id)}
                                className="w-8 h-8 rounded-lg bg-red-500/90 backdrop-blur-sm flex items-center justify-center text-white hover:bg-red-500 transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                          <div className="p-4">
                            <input
                              type="text"
                              value={photo.caption}
                              onChange={(e) => updatePhotoCaption(photo.id, e.target.value)}
                              placeholder="给这张照片起个标题..."
                              className="w-full px-3 py-2 rounded-lg bg-gray-50/70 border border-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-brand-200 focus:border-brand-300 transition-all placeholder:text-gray-400"
                            />
                            <div className="flex items-center justify-between mt-3 text-xs text-gray-400">
                              <span>{photo.uploadedAt.split('T')[0]}</span>
                              <span className="inline-flex items-center gap-1">
                                <GripVertical className="w-3 h-3" />
                                拖拽排序
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}

                      {photos.length < 20 && (
                        <button
                          onClick={addPhoto}
                          className="aspect-[4/3] rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50/50 hover:border-brand-300 hover:bg-brand-50/30 transition-all flex flex-col items-center justify-center gap-2 text-gray-400 hover:text-brand-500 group"
                        >
                          <div className="w-12 h-12 rounded-xl bg-white shadow-soft flex items-center justify-center group-hover:scale-105 transition-transform">
                            <Plus className="w-6 h-6" />
                          </div>
                          <span className="text-sm font-medium">添加照片</span>
                          <span className="text-xs text-gray-400">{photos.length}/20</span>
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'security' && (
                <div className="max-w-xl space-y-6 animate-fade-in">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 mb-1">账号安全</h2>
                    <p className="text-sm text-gray-500">修改登录密码，保护账号安全</p>
                  </div>

                  <Card padding="md" className="bg-gradient-to-br from-gray-50/70 to-white">
                    <div className="flex items-center gap-3 mb-5">
                      <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
                        <Lock className="w-5 h-5 text-amber-600" />
                      </div>
                      <div>
                        <h3 className="text-base font-semibold text-gray-900">修改登录密码</h3>
                        <p className="text-xs text-gray-500 mt-0.5">建议定期更换密码以确保账号安全</p>
                      </div>
                    </div>

                    <div className="space-y-5">
                      <div className="relative">
                        <Input
                          label="当前密码"
                          type={security.showCurrent ? 'text' : 'password'}
                          value={security.currentPassword}
                          onChange={(v) => setSecurity({ ...security, currentPassword: v })}
                          prefixIcon={<Lock className="w-4 h-4" />}
                        />
                        <button
                          onClick={() => setSecurity({ ...security, showCurrent: !security.showCurrent })}
                          className="absolute right-11 top-[38px] text-gray-400 hover:text-gray-600 transition-colors"
                        >
                          {security.showCurrent ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </button>
                      </div>

                      <div className="relative">
                        <Input
                          label="新密码"
                          type={security.showNew ? 'text' : 'password'}
                          value={security.newPassword}
                          onChange={(v) => setSecurity({ ...security, newPassword: v })}
                          prefixIcon={<Lock className="w-4 h-4" />}
                          helperText="密码长度至少8位，包含字母和数字"
                        />
                        <button
                          onClick={() => setSecurity({ ...security, showNew: !security.showNew })}
                          className="absolute right-11 top-[38px] text-gray-400 hover:text-gray-600 transition-colors"
                        >
                          {security.showNew ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </button>
                      </div>

                      <div className="relative">
                        <Input
                          label="确认新密码"
                          type={security.showConfirm ? 'text' : 'password'}
                          value={security.confirmPassword}
                          onChange={(v) => setSecurity({ ...security, confirmPassword: v })}
                          prefixIcon={<Lock className="w-4 h-4" />}
                        />
                        <button
                          onClick={() => setSecurity({ ...security, showConfirm: !security.showConfirm })}
                          className="absolute right-11 top-[38px] text-gray-400 hover:text-gray-600 transition-colors"
                        >
                          {security.showConfirm ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </button>
                      </div>

                      {security.newPassword && security.confirmPassword && (
                        <div
                          className={cn(
                            'flex items-center gap-2 p-3 rounded-xl text-sm font-medium',
                            security.newPassword === security.confirmPassword
                              ? 'bg-forest-50 text-forest-700 border border-forest-100'
                              : 'bg-red-50 text-red-600 border border-red-100'
                          )}
                        >
                          {security.newPassword === security.confirmPassword ? (
                            <><CheckCircle2 className="w-4 h-4" /> 两次密码输入一致</>
                          ) : (
                            <><AlertCircle className="w-4 h-4" /> 两次密码输入不一致</>
                          )}
                        </div>
                      )}

                      <Button
                        fullWidth
                        disabled={
                          !security.currentPassword ||
                          !security.newPassword ||
                          !security.confirmPassword ||
                          security.newPassword !== security.confirmPassword
                        }
                        icon={<Save className="w-4 h-4" />}
                        size="lg"
                        onClick={() => {
                          setSecurity({
                            currentPassword: '',
                            newPassword: '',
                            confirmPassword: '',
                            showCurrent: false,
                            showNew: false,
                            showConfirm: false,
                          });
                          setShowSuccess(true);
                          setTimeout(() => setShowSuccess(false), 3000);
                        }}
                      >
                        更新密码
                      </Button>
                    </div>
                  </Card>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Card padding="md" hover>
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                          <Phone className="w-5 h-5 text-blue-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-semibold text-gray-900 mb-0.5">绑定手机</h4>
                          <p className="text-xs text-gray-500 mb-3">已绑定 {basicInfo.phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')}</p>
                          <Button size="sm" variant="outline">更换</Button>
                        </div>
                      </div>
                    </Card>

                    <Card padding="md" hover>
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center shrink-0">
                          <Shield className="w-5 h-5 text-purple-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-semibold text-gray-900 mb-0.5">平台认证</h4>
                          <p className="text-xs text-gray-500 mb-3">
                            {safeProvider?.certified ? (
                              <span className="inline-flex items-center gap-1 text-forest-600">
                                <CheckCircle2 className="w-3.5 h-3.5" /> 已通过认证
                              </span>
                            ) : (
                              '尚未完成认证'
                            )}
                          </p>
                          <Button size="sm" variant="outline" disabled={safeProvider?.certified}>
                            {safeProvider?.certified ? '已认证' : '去认证'}
                          </Button>
                        </div>
                      </div>
                    </Card>
                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>
      </main>

      {showSuccess && (
        <div className="fixed bottom-6 right-6 z-50 animate-fade-in-up">
          <div className="flex items-center gap-3 px-5 py-3.5 rounded-2xl bg-forest-500 text-white shadow-card">
            <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-semibold">保存成功</div>
              <div className="text-xs text-white/80">您的设置已更新</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
