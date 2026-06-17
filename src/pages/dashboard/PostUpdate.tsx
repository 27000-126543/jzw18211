import { useState, useMemo } from 'react';
import {
  ImagePlus,
  Send,
  Clock,
  X,
  Upload,
  Sparkles,
  CheckCircle2,
  PawPrint,
  Image as ImageIcon,
  CalendarDays,
  ChevronDown,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/store';
import ProviderSidebar from '@/components/layout/ProviderSidebar';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';
import Input from '@/components/common/Input';
import Avatar from '@/components/common/Avatar';
import Empty from '@/components/Empty';
import { getServiceLabel } from '@/utils/format';
import { formatDate, formatRelative } from '@/utils/date';
import type { Order } from '@/types';

export default function DashboardPostUpdate() {
  const { orders, providers, pets, users, updates, currentUser, addUpdate } = useAppStore();
  const [selectedOrderId, setSelectedOrderId] = useState('');
  const [content, setContent] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [scheduledTime, setScheduledTime] = useState('');
  const [showOrderDropdown, setShowOrderDropdown] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currentProvider = useMemo(() => {
    return providers.find((p) => p.userId === currentUser?.id) || providers[0];
  }, [providers, currentUser]);

  const inServiceOrders = useMemo(() => {
    if (!currentProvider) return [] as Order[];
    return orders.filter(
      (o) =>
        o.providerId === currentProvider.id &&
        (o.status === 'in_service' || o.status === 'confirmed')
    );
  }, [orders, currentProvider]);

  const selectedOrder = useMemo(() => {
    return inServiceOrders.find((o) => o.id === selectedOrderId);
  }, [inServiceOrders, selectedOrderId]);

  const selectedPet = useMemo(() => {
    if (!selectedOrder) return null;
    return pets.find((p) => p.id === selectedOrder.petId);
  }, [selectedOrder, pets]);

  const myUpdates = useMemo(() => {
    if (!currentProvider) return [];
    return updates
      .filter((u) => u.providerId === currentProvider.id)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [updates, currentProvider]);

  const MAX_IMAGES = 9;
  const MAX_CONTENT = 500;

  const handleAddImage = () => {
    if (images.length >= MAX_IMAGES) return;
    const placeholders = [
      'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=600&q=80',
      'https://images.unsplash.com/photo-1558788353-f76d92427f16?w=600&q=80',
      'https://images.unsplash.com/photo-1560743641-3914f2c45636?w=600&q=80',
      'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=600&q=80',
      'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=600&q=80',
      'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=600&q=80',
      'https://images.unsplash.com/photo-1601758003122-43d7352454f5?w=600&q=80',
      'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=600&q=80',
      'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=600&q=80',
    ];
    setImages([...images, placeholders[images.length % placeholders.length]]);
  };

  const handleRemoveImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    handleAddImage();
  };

  const canSubmit = content.trim().length > 0 && !isSubmitting;

  const handlePublish = async () => {
    if (!canSubmit) return;
    if (!selectedOrderId) {
      alert('请选择关联的订单');
      return;
    }

    setIsSubmitting(true);

    await new Promise((r) => setTimeout(r, 800));

    if (currentProvider) {
      addUpdate({
        orderId: selectedOrderId,
        providerId: currentProvider.id,
        content: content.trim(),
        images,
      });
    }

    setIsSubmitting(false);
    setShowSuccess(true);
    setContent('');
    setImages([]);
    setScheduledTime('');
    setSelectedOrderId('');

    setTimeout(() => setShowSuccess(false), 3000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream-50/30 via-white to-petal-50/20 flex">
      <ProviderSidebar />

      <main className="flex-1 min-w-0 p-6 md:p-8 overflow-auto">
        <div className="max-w-5xl mx-auto">
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-brand-100 to-amber-100 flex items-center justify-center">
                <ImagePlus className="w-6 h-6 text-brand-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">发布动态</h1>
                <p className="text-sm text-gray-500">分享宠物日常，让宠主更放心</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            <div className="lg:col-span-3 space-y-6">
              <Card>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-brand-400 flex items-center justify-center text-white shadow-float">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <h2 className="text-lg font-semibold text-gray-900">新建动态</h2>
                </div>

                <div className="mb-5">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    关联订单
                    <span className="text-red-500 ml-1">*</span>
                  </label>
                  <div className="relative">
                    <button
                      onClick={() => setShowOrderDropdown(!showOrderDropdown)}
                      className={cn(
                        'w-full flex items-center justify-between gap-3 p-4 rounded-xl border transition-all duration-200 text-left',
                        showOrderDropdown
                          ? 'border-brand-400 ring-4 ring-brand-100 bg-white'
                          : 'border-gray-200 bg-gray-50/50 hover:border-gray-300 hover:bg-white'
                      )}
                    >
                      {selectedOrder && selectedPet ? (
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <Avatar size="sm" src={(selectedPet as any).avatar} name={selectedPet.name} className="bg-petal-50" />
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-semibold text-gray-900 truncate">
                              {selectedPet.name}
                              <span className="text-xs font-normal text-gray-500 ml-2">
                                · {getServiceLabel(selectedOrder.serviceType)}
                              </span>
                            </div>
                            <div className="text-xs text-gray-500 truncate">
                              {formatDate(selectedOrder.startDate)} ~ {formatDate(selectedOrder.endDate)}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400">选择进行中的订单...</span>
                      )}
                      <ChevronDown
                        className={cn(
                          'w-5 h-5 text-gray-400 shrink-0 transition-transform',
                          showOrderDropdown && 'rotate-180'
                        )}
                      />
                    </button>

                    {showOrderDropdown && (
                      <>
                        <div className="fixed inset-0 z-10" onClick={() => setShowOrderDropdown(false)} />
                        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl border border-gray-100 shadow-card z-20 max-h-80 overflow-auto animate-scale-in origin-top">
                          {inServiceOrders.length === 0 ? (
                            <div className="p-8 text-center">
                              <Empty
                                title="暂无进行中的订单"
                                description="等有新订单后再发布动态吧"
                              />
                            </div>
                          ) : (
                            <div className="p-2">
                              {inServiceOrders.map((order) => {
                                const pet = pets.find((p) => p.id === order.petId);
                                return (
                                  <button
                                    key={order.id}
                                    onClick={() => {
                                      setSelectedOrderId(order.id);
                                      setShowOrderDropdown(false);
                                    }}
                                    className={cn(
                                      'w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all duration-200',
                                      selectedOrderId === order.id
                                        ? 'bg-brand-50 border border-brand-200'
                                        : 'hover:bg-gray-50'
                                    )}
                                  >
                                    <Avatar
                                      size="sm"
                                      src={(pet as any)?.avatar}
                                      name={pet?.name || ''}
                                      className="bg-petal-50 shrink-0"
                                    />
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center gap-2 mb-0.5">
                                        <span className="text-sm font-semibold text-gray-900 truncate">
                                          {pet?.name}
                                        </span>
                                        <span
                                          className={cn(
                                            'px-1.5 py-0.5 rounded text-[10px] font-medium',
                                            order.status === 'in_service'
                                              ? 'bg-forest-50 text-forest-700'
                                              : 'bg-blue-50 text-blue-700'
                                          )}
                                        >
                                          {order.status === 'in_service' ? '服务中' : '已确认'}
                                        </span>
                                      </div>
                                      <div className="text-xs text-gray-500 truncate">
                                        {formatDate(order.startDate)} ~ {formatDate(order.endDate)}
                                        <span className="mx-1.5">·</span>
                                        {getServiceLabel(order.serviceType)}
                                      </div>
                                    </div>
                                    {selectedOrderId === order.id && (
                                      <CheckCircle2 className="w-5 h-5 text-brand-500 shrink-0" />
                                    )}
                                  </button>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                </div>

                <div className="mb-5">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium text-gray-700">
                      动态内容
                      <span className="text-red-500 ml-1">*</span>
                    </label>
                    <span
                      className={cn(
                        'text-xs font-medium',
                        content.length >= MAX_CONTENT ? 'text-red-500' : 'text-gray-400'
                      )}
                    >
                      {content.length}/{MAX_CONTENT}
                    </span>
                  </div>
                  <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value.slice(0, MAX_CONTENT))}
                    placeholder="分享宠物今天的状态：饮食、活动、心情等，让宠主更安心..."
                    className="w-full h-40 px-4 py-3 rounded-xl border border-gray-200 bg-gray-50/50 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-brand-200 focus:border-brand-300 transition-all placeholder:text-gray-400 leading-relaxed"
                  />
                  <div className="flex flex-wrap gap-2 mt-3">
                    {['今天玩得很开心！', '胃口不错，全部吃完啦', '午休时间，睡得很香', '散步归来，状态很棒'].map((tip) => (
                      <button
                        key={tip}
                        onClick={() => setContent(content ? `${content} ${tip}` : tip)}
                        className="px-3 py-1.5 rounded-full bg-cream-50 text-brand-700 text-xs font-medium hover:bg-brand-50 transition-colors"
                      >
                        {tip}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mb-5">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium text-gray-700">
                      上传图片
                      <span className="text-xs font-normal text-gray-400 ml-1">
                        (最多{MAX_IMAGES}张)
                      </span>
                    </label>
                    <span className="text-xs text-gray-400">
                      {images.length}/{MAX_IMAGES}
                    </span>
                  </div>

                  {images.length === 0 ? (
                    <div
                      onDragOver={handleDragOver}
                      onDrop={handleDrop}
                      onClick={handleAddImage}
                      className="h-48 rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50/50 hover:border-brand-300 hover:bg-brand-50/30 transition-all cursor-pointer flex flex-col items-center justify-center gap-3 group"
                    >
                      <div className="w-14 h-14 rounded-2xl bg-white shadow-soft flex items-center justify-center group-hover:scale-105 transition-transform">
                        <Upload className="w-7 h-7 text-brand-400" />
                      </div>
                      <div className="text-center">
                        <div className="text-sm font-medium text-gray-700 mb-0.5">拖拽图片到这里</div>
                        <div className="text-xs text-gray-400">或点击选择图片上传</div>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-3 gap-2.5">
                      {images.map((img, idx) => (
                        <div
                          key={idx}
                          className="relative aspect-square rounded-xl overflow-hidden bg-gray-100 group"
                        >
                          <img
                            src={img}
                            alt={`动态图片 ${idx + 1}`}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <button
                              onClick={() => handleRemoveImage(idx)}
                              className="w-9 h-9 rounded-full bg-white/90 flex items-center justify-center text-red-500 hover:bg-white hover:scale-110 transition-all"
                            >
                              <X className="w-5 h-5" />
                            </button>
                          </div>
                          <div className="absolute top-1.5 left-1.5 px-2 py-0.5 rounded-md bg-black/50 text-white text-[10px] font-medium">
                            {idx + 1}
                          </div>
                        </div>
                      ))}
                      {images.length < MAX_IMAGES && (
                        <button
                          onClick={handleAddImage}
                          className="aspect-square rounded-xl border-2 border-dashed border-gray-200 bg-gray-50/50 hover:border-brand-300 hover:bg-brand-50/30 transition-all flex flex-col items-center justify-center gap-1.5 text-gray-400 hover:text-brand-500"
                        >
                          <ImagePlus className="w-6 h-6" />
                          <span className="text-xs">添加图片</span>
                        </button>
                      )}
                    </div>
                  )}
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-4 h-4" />
                      定时发布（可选）
                    </div>
                  </label>
                  <Input
                    type="datetime-local"
                    value={scheduledTime}
                    onChange={setScheduledTime}
                    placeholder="选择发布时间"
                  />
                  {scheduledTime && (
                    <p className="text-xs text-brand-600 mt-2 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      将于 {formatRelative(new Date(scheduledTime))} 自动发布
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <Button
                    fullWidth
                    loading={isSubmitting}
                    disabled={!canSubmit}
                    icon={<Send className="w-4 h-4" />}
                    size="lg"
                    onClick={handlePublish}
                  >
                    {scheduledTime ? '设置定时发布' : '立即发布'}
                  </Button>
                </div>

                {showSuccess && (
                  <div className="mt-5 p-4 rounded-xl bg-forest-50 border border-forest-200 flex items-center gap-3 animate-fade-in-up">
                    <div className="w-10 h-10 rounded-full bg-forest-500 flex items-center justify-center shrink-0">
                      <CheckCircle2 className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-forest-800">动态发布成功！</div>
                      <div className="text-xs text-forest-600">宠主们已经可以看到啦~</div>
                    </div>
                  </div>
                )}
              </Card>
            </div>

            <div className="lg:col-span-2 space-y-6">
              <Card hover>
                <div className="flex items-center gap-2 mb-5">
                  <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-gray-900">发布小贴士</h3>
                  </div>
                </div>
                <div className="space-y-3">
                  {[
                    '每天发布1-2条动态，宠主更安心',
                    '多拍一些小视频，效果更好哦',
                    '可以记录吃饭、玩耍、休息等日常',
                    '有特殊情况要第一时间告知',
                  ].map((tip, idx) => (
                    <div key={idx} className="flex items-start gap-2.5">
                      <div className="w-5 h-5 rounded-full bg-gradient-to-br from-brand-100 to-petal-100 flex items-center justify-center shrink-0 mt-0.5">
                        <span className="text-[10px] font-bold text-brand-600">{idx + 1}</span>
                      </div>
                      <span className="text-sm text-gray-600 leading-relaxed">{tip}</span>
                    </div>
                  ))}
                </div>
              </Card>

              <Card>
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center">
                      <ImageIcon className="w-5 h-5 text-brand-500" />
                    </div>
                    <div>
                      <h3 className="text-base font-semibold text-gray-900">历史动态</h3>
                      <p className="text-xs text-gray-400 mt-0.5">共 {myUpdates.length} 条</p>
                    </div>
                  </div>
                </div>

                {myUpdates.length === 0 ? (
                  <div className="py-8">
                    <Empty
                      title="还没有发布过动态"
                      description="发布第一条动态吧~"
                    />
                  </div>
                ) : (
                  <div className="space-y-4 max-h-[600px] overflow-auto pr-2 -mr-2">
                    {myUpdates.slice(0, 5).map((update, idx) => (
                      <div
                        key={update.id}
                        className="p-4 rounded-xl bg-gray-50/50 hover:bg-gray-50 transition-colors animate-fade-in-up"
                        style={{ animationDelay: `${idx * 50}ms` }}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs text-gray-400">
                            {formatRelative(update.createdAt)}
                          </span>
                          <div className="flex items-center gap-1 text-xs text-gray-400">
                            <PawPrint className="w-3 h-3" />
                            {update.likes}
                          </div>
                        </div>
                        <p className="text-sm text-gray-700 leading-relaxed mb-3 line-clamp-3">
                          {update.content}
                        </p>
                        {update.images && update.images.length > 0 && (
                          <div className="grid grid-cols-3 gap-1.5">
                            {update.images.slice(0, 3).map((img, imgIdx) => (
                              <div
                                key={imgIdx}
                                className="aspect-square rounded-lg overflow-hidden bg-gray-100"
                              >
                                <img
                                  src={img}
                                  alt={`动态图片 ${imgIdx + 1}`}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            ))}
                            {update.images.length > 3 && (
                              <div className="aspect-square rounded-lg bg-gray-200 flex items-center justify-center">
                                <span className="text-sm font-semibold text-gray-600">
                                  +{update.images.length - 3}
                                </span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
