import { useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import {
  MapPin,
  Phone,
  Star,
  CalendarDays,
  Clock,
  PawPrint,
  Upload,
  Send,
  ImagePlus,
  HelpCircle,
  ChevronRight,
  CheckCircle2,
  PlayCircle,
  XCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/store';
import OrderTimeline from '@/components/order/OrderTimeline';
import UpdateTimeline from '@/components/order/UpdateTimeline';
import ChatWindow from '@/components/chat/ChatWindow';
import BalancePayment from '@/components/order/BalancePayment';
import ReviewForm from '@/components/order/ReviewForm';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';
import Input from '@/components/common/Input';
import Avatar from '@/components/common/Avatar';
import StarRating from '@/components/common/StarRating';
import { getServiceLabel, getStatusLabel, getStatusColor, formatCurrency, getOrderTotal, getOrderDeposit, getOrderBalance, getProviderName, getServiceDailyPrice } from '@/utils/format';
import { toSafeProvider } from '@/utils/provider';
import { formatDateTime, formatDate, getDaysBetween } from '@/utils/date';
import type { Order } from '@/types';

export default function OrderDetail() {
  const { id } = useParams<{ id: string }>();
  const { orders, providers, pets, users, reviews, updates, messages, currentUser, updateOrderStatus, addUpdate, addMessage, payBalance } = useAppStore();

  const [updateContent, setUpdateContent] = useState('');
  const [updateImages, setUpdateImages] = useState<string[]>([]);
  const [showPaymentSuccess, setShowPaymentSuccess] = useState(false);

  const order = useMemo(() => orders.find((o) => o.id === id), [orders, id]);
  const provider = useMemo(() => providers.find((p) => p.id === order?.providerId), [providers, order]);
  const safeProvider = useMemo(() => provider ? toSafeProvider(provider) : null, [provider]);
  const pet = useMemo(() => pets.find((p) => p.id === order?.petId), [pets, order]);
  const owner = useMemo(() => users.find((u) => u.id === order?.ownerId), [users, order]);
  const providerUser = useMemo(() => users.find((u) => u.id === safeProvider?.userId), [users, safeProvider]);

  const service = useMemo(() => provider?.services.find((s) => s.id === order?.serviceId), [provider, order]);
  const orderUpdates = useMemo(() => updates.filter((u) => (u as any).orderId === order?.id || u.providerId === order?.providerId), [updates, order]);
  const orderReview = useMemo(() => reviews.find((r) => r.orderId === order?.id), [reviews, order]);

  const orderTotal = getOrderTotal(order);
  const orderDeposit = getOrderDeposit(order);
  const orderBalance = getOrderBalance(order);

  const safeOrder = useMemo(() => {
    if (!order) return null;
    return {
      ...order,
      totalAmount: orderTotal,
      depositAmount: orderDeposit,
      balanceAmount: orderBalance,
      totalPrice: orderTotal,
      deposit: orderDeposit,
    };
  }, [order, orderTotal, orderDeposit, orderBalance]);

  const orderMessages = useMemo(() => {
    if (!order || !currentUser) return [];
    return messages.filter(m => m.orderId === order.id);
  }, [messages, order, currentUser]);

  const isProvider = currentUser?.role === 'provider';
  const isOwner = currentUser?.role === 'owner';

  const handleAddUpdateImage = () => {
    if (updateImages.length >= 9) return;
    const placeholders = [
      'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400',
      'https://images.unsplash.com/photo-1558788353-f76d92427f16?w=400',
      'https://images.unsplash.com/photo-1560743641-3914f2c45636?w=400',
      'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=400',
      'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=400',
    ];
    setUpdateImages([...updateImages, placeholders[updateImages.length % placeholders.length]]);
  };

  const handleRemoveUpdateImage = (index: number) => {
    setUpdateImages(updateImages.filter((_, i) => i !== index));
  };

  const handlePublishUpdate = () => {
    if (!updateContent.trim() || !order) return;
    addUpdate({
      orderId: order.id,
      providerId: order.providerId,
      content: updateContent.trim(),
      images: updateImages,
    });
    setUpdateContent('');
    setUpdateImages([]);
  };

  const handleSendMessage = (content: string) => {
    if (!order || !currentUser) return;
    const receiverId = isOwner ? order.providerId : order.ownerId;
    addMessage({
      orderId: order.id,
      senderId: currentUser.id,
      receiverId,
      content,
    });
  };

  const handleStatusChange = (newStatus: Order['status']) => {
    if (!order) return;
    updateOrderStatus(order.id, newStatus);
  };

  const handlePayBalance = () => {
    if (!order) return;
    payBalance(order.id);
    setShowPaymentSuccess(true);
  };

  if (!order || !provider || !pet) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream-50/30">
        <div className="text-center">
          <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gray-100 flex items-center justify-center">
            <XCircle className="w-10 h-10 text-gray-400" />
          </div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">订单不存在</h2>
          <p className="text-gray-500">请检查订单ID是否正确</p>
        </div>
      </div>
    );
  }

  const chatOtherUser = isOwner
    ? { id: safeProvider?.id || '', name: safeProvider?.displayName || '', avatar: (providerUser as any)?.avatar || '', online: true }
    : { id: owner?.id || '', name: owner?.name || '', avatar: (owner as any)?.avatar || '', online: true };

  const days = getDaysBetween(order.startDate, order.endDate);
  const orderNo = (order as any).orderNo || order.id.toUpperCase();

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream-50/40 via-white to-petal-50/20 py-8 px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl font-bold text-gray-900">订单详情</h1>
                <span className={cn('px-3 py-1 rounded-full text-xs font-medium border', getStatusColor(order.status))}>
                  {getStatusLabel(order.status)}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-sm text-gray-500">
                <span>订单号：<span className="font-mono text-gray-700">{orderNo}</span></span>
                <span>创建时间：{formatDateTime(order.createdAt)}</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {isProvider && order.status === 'pending_confirm' && (
                <Button onClick={() => handleStatusChange('confirmed')} icon={<CheckCircle2 className="w-4 h-4" />}>
                  确认订单
                </Button>
              )}
              {isProvider && order.status === 'confirmed' && (
                <Button variant="secondary" onClick={() => handleStatusChange('in_service')} icon={<PlayCircle className="w-4 h-4" />}>
                  开始服务
                </Button>
              )}
              {isProvider && order.status === 'in_service' && (
                <Button variant="secondary" onClick={() => handleStatusChange('pending_balance')} icon={<CheckCircle2 className="w-4 h-4" />}>
                  结束服务
                </Button>
              )}
              <Button variant="outline" size="sm">
                导出订单
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 space-y-6">
            <OrderTimeline status={order.status} createdAt={order.createdAt} />

            {isProvider && order.status === 'in_service' && (
              <Card className="animate-fade-in-up">
                <h3 className="text-base font-semibold text-gray-900 mb-5">发布寄养动态</h3>
                <textarea
                  value={updateContent}
                  onChange={(e) => setUpdateContent(e.target.value)}
                  placeholder="记录宠物今天的状态、活动、饮食等情况..."
                  className="w-full h-28 px-4 py-3 rounded-xl border border-gray-200 bg-gray-50/50 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-brand-200 focus:border-brand-300 transition-all placeholder:text-gray-400"
                  maxLength={500}
                />
                <div className="flex items-center justify-between mt-2 mb-4">
                  <div className="text-xs text-gray-400">{updateContent.length}/500</div>
                </div>

                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-9 gap-2.5 mb-5">
                  {updateImages.map((img, idx) => (
                    <div key={idx} className="relative aspect-square rounded-xl overflow-hidden bg-gray-100 group">
                      <img src={img} alt={`动态图片 ${idx + 1}`} className="w-full h-full object-cover" />
                      <button
                        onClick={() => handleRemoveUpdateImage(idx)}
                        className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <XCircle className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  {updateImages.length < 9 && (
                    <button
                      onClick={handleAddUpdateImage}
                      className="aspect-square rounded-xl border-2 border-dashed border-gray-200 bg-gray-50/50 flex flex-col items-center justify-center gap-1.5 text-gray-400 hover:border-brand-300 hover:bg-brand-50/30 hover:text-brand-500 transition-all"
                    >
                      <ImagePlus className="w-6 h-6" />
                      <span className="text-xs">上传图片</span>
                    </button>
                  )}
                </div>

                <div className="flex justify-end">
                  <Button
                    onClick={handlePublishUpdate}
                    disabled={!updateContent.trim()}
                    icon={<Send className="w-4 h-4" />}
                  >
                    发布动态
                  </Button>
                </div>
              </Card>
            )}

            <UpdateTimeline updates={orderUpdates} />

            {isOwner && order.status === 'pending_balance' && !showPaymentSuccess && safeOrder && (
              <BalancePayment order={safeOrder as any} onPay={handlePayBalance} />
            )}

            {showPaymentSuccess && (
              <Card className="text-center p-8">
                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-forest-50 flex items-center justify-center">
                  <CheckCircle2 className="w-12 h-12 text-forest-500" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">尾款支付成功</h3>
                <p className="text-sm text-gray-500">感谢您的使用，期待您的评价！</p>
              </Card>
            )}

            {order.status === 'completed' && !orderReview && isOwner && (
              <ReviewForm orderId={order.id} providerId={order.providerId} />
            )}

            {orderReview && (
              <Card>
                <h3 className="text-base font-semibold text-gray-900 mb-4">我的评价</h3>
                <div className="flex items-center gap-2 mb-3">
                  <StarRating value={orderReview.rating} />
                  <span className="text-xs text-gray-400 ml-2">{formatDateTime(orderReview.createdAt)}</span>
                </div>
                <p className="text-sm text-gray-700 leading-relaxed">{orderReview.content}</p>
                {orderReview.photos && orderReview.photos.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 mt-4">
                    {orderReview.photos.map((photo, idx) => (
                      <div key={idx} className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                        <img src={photo} alt={`评价图片 ${idx + 1}`} className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            )}

            <Card className="overflow-hidden p-0">
              <div className="h-[500px] flex flex-col">
                <ChatWindow
                  conversationId={order.id}
                  messages={orderMessages as any}
                  currentUserId={currentUser?.id || ''}
                  otherUser={chatOtherUser as any}
                  onSend={handleSendMessage}
                />
              </div>
            </Card>
          </div>

          <div className="lg:col-span-4 space-y-6">
            <div className="lg:sticky lg:top-6 space-y-6">
              <Card hover>
                <div className="flex items-start gap-4 mb-5">
                  <Avatar size="lg" src={(providerUser as any)?.avatar} name={safeProvider?.displayName} />
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base font-semibold text-gray-900 mb-1 truncate">{safeProvider?.displayName}</h3>
                    <div className="flex items-center gap-1.5 mb-2">
                      <div className="flex items-center gap-0.5">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={cn(
                              'w-3.5 h-3.5',
                              i < Math.floor(safeProvider?.rating || 0) ? 'fill-amber-400 text-amber-400' : 'fill-gray-100 text-gray-200'
                            )}
                          />
                        ))}
                      </div>
                      <span className="text-sm font-medium text-amber-600">{safeProvider?.rating}</span>
                      <span className="text-xs text-gray-400">({safeProvider?.reviewCount}条评价)</span>
                    </div>
                    {safeProvider?.certified && (
                      <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-brand-50 text-brand-600 text-xs font-medium">
                        <CheckCircle2 className="w-3 h-3" />
                        平台认证
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-start gap-2.5">
                    <MapPin className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <div className="text-xs text-gray-400 mb-0.5">地址</div>
                      <div className="text-sm text-gray-700">{safeProvider?.address}</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <Phone className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <div className="text-xs text-gray-400 mb-0.5">联系方式</div>
                      <div className="text-sm text-gray-700">{(providerUser as any)?.phone || '-'}</div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 mt-5 pt-5 border-t border-gray-50">
                  <Button variant="outline" size="sm" fullWidth icon={<Phone className="w-4 h-4" />}>
                    联系商家
                  </Button>
                  <Button variant="ghost" size="sm" fullWidth icon={<HelpCircle className="w-4 h-4" />}>
                    客服
                  </Button>
                </div>
              </Card>

              <Card hover>
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-xl bg-petal-100/70 flex items-center justify-center">
                    <PawPrint className="w-4 h-4 text-pink-600" />
                  </div>
                  <h3 className="text-base font-semibold text-gray-900">宠物信息</h3>
                </div>

                <div className="flex items-center gap-4 mb-4">
                  <Avatar size="lg" src={(pet as any).avatar} name={pet.name} className="bg-petal-50" />
                  <div className="flex-1 min-w-0">
                    <h4 className="text-lg font-bold text-gray-900 mb-1">{pet.name}</h4>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-gray-500">
                      <span>{pet.breed}</span>
                      <span className="w-1 h-1 rounded-full bg-gray-300" />
                      <span>{pet.age}岁</span>
                      <span className="w-1 h-1 rounded-full bg-gray-300" />
                      <span>{pet.weight}kg</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mb-3">
                  <span className={cn(
                    'inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium',
                    pet.vaccinated ? 'bg-forest-50 text-forest-700' : 'bg-red-50 text-red-600'
                  )}>
                    {pet.vaccinated ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                    {pet.vaccinated ? '已接种疫苗' : '未接种疫苗'}
                  </span>
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                    {pet.species === 'dog' ? '狗狗' : pet.species === 'cat' ? '猫咪' : '其他'}
                  </span>
                </div>

                {pet.description && (
                  <div className="bg-gray-50/70 rounded-xl p-3 text-xs text-gray-600 leading-relaxed">
                    {pet.description}
                  </div>
                )}
              </Card>

              <Card hover>
                <div className="flex items-center gap-2 mb-5">
                  <div className="w-8 h-8 rounded-xl bg-forest-100/70 flex items-center justify-center">
                    <CalendarDays className="w-4 h-4 text-forest-600" />
                  </div>
                  <h3 className="text-base font-semibold text-gray-900">服务信息</h3>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">服务类型</span>
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-forest-50 text-forest-700 text-sm font-medium">
                      {getServiceLabel(order.serviceType)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">服务名称</span>
                    <span className="text-sm font-medium text-gray-800">{service?.name || '-'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">寄养日期</span>
                    <span className="text-sm text-gray-800 text-right">
                      {formatDate(order.startDate)}
                      <ChevronRight className="w-3.5 h-3.5 inline mx-1 text-gray-400" />
                      {formatDate(order.endDate)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">服务时段</span>
                    <span className="text-sm text-gray-800">{(order as any).timeSlot || '全天'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">服务天数</span>
                    <span className="text-sm font-medium text-gray-800">{days} 天</span>
                  </div>
                </div>
              </Card>

              <Card hover>
                <div className="flex items-center gap-2 mb-5">
                  <div className="w-8 h-8 rounded-xl bg-brand-100/70 flex items-center justify-center">
                    <Clock className="w-4 h-4 text-brand-600" />
                  </div>
                  <h3 className="text-base font-semibold text-gray-900">费用明细</h3>
                </div>

                <div className="space-y-3 mb-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">{service?.name || '服务费'}</span>
                    <span className="text-sm text-gray-800">{formatCurrency(orderTotal)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">已付定金</span>
                    <span className="text-sm text-forest-600">-{formatCurrency(orderDeposit)}</span>
                  </div>
                </div>

                <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent mb-4" />

                <div className="space-y-2 mb-5">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">应付尾款</span>
                    <span className="text-xl font-bold text-brand-600">
                      {formatCurrency(orderBalance)}
                    </span>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-brand-50/70 to-petal-50/50 rounded-xl p-4 border border-brand-100/30">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">订单总额</span>
                    <span className="text-lg font-bold text-gray-900">{formatCurrency(orderTotal)}</span>
                  </div>
                </div>
              </Card>

              <Card hover className="bg-gradient-to-br from-brand-50/50 via-white to-petal-50/30 border-brand-100/50">
                <button className="w-full flex items-center gap-3 text-left">
                  <div className="w-10 h-10 rounded-xl bg-white shadow-soft flex items-center justify-center">
                    <HelpCircle className="w-5 h-5 text-brand-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-gray-800">平台客服</div>
                    <div className="text-xs text-gray-500">有问题随时联系我们</div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400 shrink-0" />
                </button>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
