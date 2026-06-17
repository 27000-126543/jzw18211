import { useState, useMemo } from 'react';
import {
  Shield,
  AlertTriangle,
  Star,
  ThumbsDown,
  FileText,
  X,
  CheckCircle2,
  Ban,
  AlertCircle,
  Eye,
  ChevronRight,
  Search,
  Clock,
  MapPin,
  User,
  MessageSquare,
  Store,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/store';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';
import Input from '@/components/common/Input';
import Avatar from '@/components/common/Avatar';
import Empty from '@/components/Empty';
import { formatCurrency } from '@/utils/format';
import { formatDateTime, formatRelative } from '@/utils/date';
import type { Provider, Review as ReviewType } from '@/types';

type TabFilter = 'all' | 'warning' | 'complaint' | 'pending';

const TABS: { id: TabFilter; label: string; icon?: React.ComponentType<{ className?: string }>; badgeClass?: string }[] = [
  { id: 'all', label: '全部商家' },
  { id: 'warning', label: '超差评预警', icon: AlertTriangle, badgeClass: 'bg-red-500' },
  { id: 'complaint', label: '投诉处理', icon: ThumbsDown, badgeClass: 'bg-amber-500' },
  { id: 'pending', label: '待资质审核', icon: FileText, badgeClass: 'bg-blue-500' },
];

interface ProviderRowData {
  provider: Provider;
  avgRating: number;
  reviewCount30d: number;
  badReviewCount: number;
  complaintCount: number;
  status: 'normal' | 'warning' | 'complaint' | 'pending' | 'suspended';
  user: any;
}

const MOCK_COMPLAINTS = [
  {
    id: 'cmp_1',
    orderId: 'order_5',
    content: '寄养期间宠物感染皮肤病，商家拒绝承担责任',
    createdAt: '2026-06-15T10:30:00.000Z',
    status: 'pending',
    type: '健康问题',
  },
  {
    id: 'cmp_2',
    orderId: 'order_6',
    content: '服务态度差，不按时发送宠物状态',
    createdAt: '2026-06-16T14:20:00.000Z',
    status: 'pending',
    type: '服务态度',
  },
];

export default function AdminReview() {
  const { providers, users, reviews } = useAppStore();
  const [activeTab, setActiveTab] = useState<TabFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProvider, setSelectedProvider] = useState<ProviderRowData | null>(null);
  const [actionModal, setActionModal] = useState<{
    provider: ProviderRowData;
    action: 'warn' | 'suspend' | 'approve';
  } | null>(null);
  const [actionNote, setActionNote] = useState('');
  const [showSuccess, setShowSuccess] = useState<string | null>(null);

  const providerList = useMemo<ProviderRowData[]>(() => {
    return providers.map((provider) => {
      const user = users.find((u) => u.id === provider.userId);
      const providerReviews = reviews.filter((r) => r.providerId === provider.id);

      const now = new Date('2026-06-18');
      const thirtyDaysAgo = new Date(now);
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const recentReviews = providerReviews.filter(
        (r) => new Date(r.createdAt) >= thirtyDaysAgo
      );
      const avgRating =
        recentReviews.length > 0
          ? recentReviews.reduce((s, r) => s + r.rating, 0) / recentReviews.length
          : provider.rating;
      const badReviewCount = recentReviews.filter((r) => r.rating <= 2).length;

      let status: ProviderRowData['status'] = 'normal';
      if (!provider.certified) {
        status = 'pending';
      } else if (badReviewCount >= 3 || avgRating <= 3.5) {
        status = 'warning';
      }
      if (provider.id === 'provider_4') status = 'complaint';
      if (provider.id === 'provider_5' && !provider.certified) status = 'pending';

      return {
        provider,
        avgRating: Math.round(avgRating * 10) / 10,
        reviewCount30d: recentReviews.length,
        badReviewCount,
        complaintCount: provider.id === 'provider_4' ? 2 : 0,
        status,
        user,
      };
    });
  }, [providers, users, reviews]);

  const stats = useMemo(() => {
    return {
      pending: providerList.filter((p) => p.status === 'pending').length,
      badToday: providerList.reduce((s, p) => s + p.badReviewCount, 0),
      complaints: MOCK_COMPLAINTS.length,
    };
  }, [providerList]);

  const filteredList = useMemo(() => {
    let result = [...providerList];

    if (activeTab === 'warning') {
      result = result.filter((p) => p.status === 'warning');
    } else if (activeTab === 'complaint') {
      result = result.filter((p) => p.status === 'complaint' || p.complaintCount > 0);
    } else if (activeTab === 'pending') {
      result = result.filter((p) => p.status === 'pending');
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.provider.businessName.toLowerCase().includes(query) ||
          p.provider.city.toLowerCase().includes(query) ||
          p.user?.name.toLowerCase().includes(query)
      );
    }

    return result.sort((a, b) => {
      const statusWeight = {
        complaint: 0,
        warning: 1,
        pending: 2,
        normal: 3,
        suspended: 4,
      };
      return statusWeight[a.status] - statusWeight[b.status];
    });
  }, [providerList, activeTab, searchQuery]);

  const statusConfig: Record<
    ProviderRowData['status'],
    { label: string; className: string; dotClass: string }
  > = {
    normal: { label: '正常', className: 'bg-forest-50 text-forest-700 border-forest-200', dotClass: 'bg-forest-500' },
    warning: { label: '需关注', className: 'bg-amber-50 text-amber-700 border-amber-200', dotClass: 'bg-amber-500' },
    complaint: { label: '有投诉', className: 'bg-red-50 text-red-700 border-red-200', dotClass: 'bg-red-500' },
    pending: { label: '待审核', className: 'bg-blue-50 text-blue-700 border-blue-200', dotClass: 'bg-blue-500' },
    suspended: { label: '已下架', className: 'bg-gray-100 text-gray-600 border-gray-200', dotClass: 'bg-gray-400' },
  };

  const handleActionConfirm = () => {
    if (!actionModal) return;
    const actionLabel = {
      warn: '警告已发送',
      suspend: '商家已下架',
      approve: '资质审核通过',
    };
    setShowSuccess(actionLabel[actionModal.action]);
    setActionModal(null);
    setActionNote('');
    setTimeout(() => setShowSuccess(null), 3000);
  };

  const providerBadReviews = useMemo(() => {
    if (!selectedProvider) return [] as ReviewType[];
    return reviews
      .filter(
        (r) => r.providerId === selectedProvider.provider.id && r.rating <= 3
      )
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [selectedProvider, reviews]);

  const providerComplaints = useMemo(() => {
    if (!selectedProvider) return [];
    return MOCK_COMPLAINTS.filter(
      (_, idx) => selectedProvider.provider.id === 'provider_4'
    );
  }, [selectedProvider]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/20">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-6 md:py-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">平台审核中心</h1>
              <p className="text-sm text-gray-500">管理商家资质、处理投诉和差评预警</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
          <Card hover>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <div className="text-xs font-medium text-gray-500 mb-1">待审核商家</div>
                <div className="text-2xl font-bold text-gray-900">{stats.pending}</div>
              </div>
            </div>
          </Card>
          <Card hover>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center shrink-0">
                <Star className="w-6 h-6 text-red-500" />
              </div>
              <div>
                <div className="text-xs font-medium text-gray-500 mb-1">今日新增差评</div>
                <div className="text-2xl font-bold text-gray-900">{stats.badToday}</div>
              </div>
            </div>
          </Card>
          <Card hover>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <div className="text-xs font-medium text-gray-500 mb-1">本月投诉量</div>
                <div className="text-2xl font-bold text-gray-900">{stats.complaints}</div>
              </div>
            </div>
          </Card>
        </div>

        <Card padding="none" className="overflow-hidden mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 p-6 border-b border-gray-50">
            <div className="flex gap-1 bg-gray-100 rounded-xl p-1 flex-wrap">
              {TABS.map((tab) => {
                const isActive = activeTab === tab.id;
                const count =
                  tab.id === 'all'
                    ? providerList.length
                    : tab.id === 'warning'
                    ? providerList.filter((p) => p.status === 'warning').length
                    : tab.id === 'complaint'
                    ? providerList.filter((p) => p.complaintCount > 0).length
                    : stats.pending;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={cn(
                      'inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200',
                      isActive
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-500 hover:text-gray-700'
                    )}
                  >
                    {tab.label}
                    <span
                      className={cn(
                        'inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-[10px] font-semibold',
                        isActive
                          ? 'bg-brand-500 text-white'
                          : tab.badgeClass
                          ? `${tab.badgeClass} text-white`
                          : 'bg-gray-200 text-gray-600'
                      )}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="flex-1 max-w-xs ml-auto">
              <Input
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder="搜索商家名、城市..."
                prefixIcon={<Search className="w-4 h-4" />}
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px]">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <th className="text-left py-3.5 px-5 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    商家信息
                  </th>
                  <th className="text-left py-3.5 px-5 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    近30天评分
                  </th>
                  <th className="text-center py-3.5 px-5 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    差评数
                  </th>
                  <th className="text-center py-3.5 px-5 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    投诉数
                  </th>
                  <th className="text-left py-3.5 px-5 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    状态
                  </th>
                  <th className="text-right py-3.5 px-5 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredList.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12">
                      <Empty
                        title="暂无匹配的商家"
                        description="根据当前筛选条件没有找到商家"
                      />
                    </td>
                  </tr>
                ) : (
                  filteredList.map((row, idx) => {
                    const status = statusConfig[row.status];
                    return (
                      <tr
                        key={row.provider.id}
                        className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors animate-fade-in-up"
                        style={{ animationDelay: `${idx * 20}ms` }}
                      >
                        <td className="py-4 px-5">
                          <div className="flex items-center gap-3">
                            <Avatar
                              size="md"
                              src={(row.user as any)?.avatar}
                              name={row.provider.businessName}
                              className="bg-gradient-to-br from-brand-100 to-petal-100"
                            />
                            <div className="min-w-0">
                              <div className="flex items-center gap-2 mb-0.5">
                                <span className="text-sm font-semibold text-gray-900 truncate">
                                  {row.provider.businessName}
                                </span>
                                {row.provider.certified && (
                                  <span className="inline-flex items-center px-1.5 py-0.5 rounded-md bg-brand-50 text-brand-600 text-[10px] font-medium">
                                    <CheckCircle2 className="w-3 h-3 mr-0.5" />
                                    认证
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-3 text-xs text-gray-500">
                                <span className="inline-flex items-center gap-1">
                                  <MapPin className="w-3 h-3" />
                                  {row.provider.city}
                                </span>
                                <span className="inline-flex items-center gap-1">
                                  <User className="w-3 h-3" />
                                  {row.user?.name}
                                </span>
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-5">
                          <div className="flex items-center gap-2">
                            <div className="flex items-center gap-0.5">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <Star
                                  key={i}
                                  className={cn(
                                    'w-3.5 h-3.5',
                                    i < Math.round(row.avgRating)
                                      ? 'fill-amber-400 text-amber-400'
                                      : 'fill-gray-100 text-gray-200'
                                  )}
                                />
                              ))}
                            </div>
                            <span
                              className={cn(
                                'text-sm font-semibold',
                                row.avgRating <= 3
                                  ? 'text-red-600'
                                  : row.avgRating <= 4
                                  ? 'text-amber-600'
                                  : 'text-forest-600'
                              )}
                            >
                              {row.avgRating.toFixed(1)}
                            </span>
                            <span className="text-xs text-gray-400">
                              ({row.reviewCount30d}条)
                            </span>
                          </div>
                        </td>
                        <td className="py-4 px-5 text-center">
                          <span
                            className={cn(
                              'inline-flex items-center justify-center min-w-[28px] h-7 px-2 rounded-lg text-sm font-semibold',
                              row.badReviewCount >= 3
                                ? 'bg-red-100 text-red-700'
                                : row.badReviewCount > 0
                                ? 'bg-amber-50 text-amber-700'
                                : 'bg-gray-50 text-gray-500'
                            )}
                          >
                            {row.badReviewCount}
                          </span>
                        </td>
                        <td className="py-4 px-5 text-center">
                          <span
                            className={cn(
                              'inline-flex items-center justify-center min-w-[28px] h-7 px-2 rounded-lg text-sm font-semibold',
                              row.complaintCount > 0
                                ? 'bg-red-100 text-red-700'
                                : 'bg-gray-50 text-gray-500'
                            )}
                          >
                            {row.complaintCount}
                          </span>
                        </td>
                        <td className="py-4 px-5">
                          <span
                            className={cn(
                              'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border',
                              status.className
                            )}
                          >
                            <span className={cn('w-1.5 h-1.5 rounded-full', status.dotClass)} />
                            {status.label}
                          </span>
                        </td>
                        <td className="py-4 px-5">
                          <div className="flex items-center justify-end gap-1.5">
                            <Button
                              variant="ghost"
                              size="sm"
                              icon={<Eye className="w-3.5 h-3.5" />}
                              onClick={() => setSelectedProvider(row)}
                            >
                              详情
                            </Button>
                            {row.status === 'warning' || row.complaintCount > 0 ? (
                              <>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="text-amber-600 border-amber-200 hover:bg-amber-50 hover:text-amber-700 hover:border-amber-300"
                                  onClick={() =>
                                    setActionModal({ provider: row, action: 'warn' })
                                  }
                                >
                                  警告
                                </Button>
                                <Button
                                  size="sm"
                                  variant="danger"
                                  onClick={() =>
                                    setActionModal({ provider: row, action: 'suspend' })
                                  }
                                >
                                  下架
                                </Button>
                              </>
                            ) : null}
                            {row.status === 'pending' && (
                              <Button
                                size="sm"
                                variant="secondary"
                                icon={<CheckCircle2 className="w-3.5 h-3.5" />}
                                onClick={() =>
                                  setActionModal({ provider: row, action: 'approve' })
                                }
                              >
                                通过
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {selectedProvider && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl shadow-card max-w-3xl w-full max-h-[90vh] overflow-auto animate-scale-in">
            <div className="sticky top-0 bg-white border-b border-gray-50 z-10">
              <div className="flex items-center justify-between p-6">
                <div className="flex items-center gap-4">
                  <Avatar
                    size="xl"
                    src={(selectedProvider.user as any)?.avatar}
                    name={selectedProvider.provider.businessName}
                  />
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-1">
                      {selectedProvider.provider.businessName}
                      {selectedProvider.provider.certified && (
                        <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-md bg-brand-50 text-brand-600 text-xs font-medium">
                          <CheckCircle2 className="w-3 h-3 mr-0.5" />
                          已认证
                        </span>
                      )}
                    </h3>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-500">
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5" />
                        {selectedProvider.provider.address}
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedProvider(null)}
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all shrink-0"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-4 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100/40">
                  <div className="text-xs text-blue-600 mb-1">近30天评分</div>
                  <div className="text-xl font-bold text-gray-900">{selectedProvider.avgRating}</div>
                </div>
                <div className="p-4 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100/40">
                  <div className="text-xs text-gray-600 mb-1">评价总数</div>
                  <div className="text-xl font-bold text-gray-900">{selectedProvider.provider.reviewCount}</div>
                </div>
                <div className="p-4 rounded-xl bg-gradient-to-br from-red-50 to-red-100/40">
                  <div className="text-xs text-red-600 mb-1">差评数</div>
                  <div className="text-xl font-bold text-gray-900">{selectedProvider.badReviewCount}</div>
                </div>
                <div className="p-4 rounded-xl bg-gradient-to-br from-amber-50 to-amber-100/40">
                  <div className="text-xs text-amber-600 mb-1">投诉数</div>
                  <div className="text-xl font-bold text-gray-900">{selectedProvider.complaintCount}</div>
                </div>
              </div>

              {providerBadReviews.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-9 h-9 rounded-xl bg-red-50 flex items-center justify-center shrink-0">
                      <ThumbsDown className="w-4.5 h-4.5 text-red-500" />
                    </div>
                    <h4 className="text-base font-semibold text-gray-900">差评聚合</h4>
                  </div>
                  <div className="space-y-3">
                    {providerBadReviews.slice(0, 5).map((review) => (
                      <div
                        key={review.id}
                        className="p-4 rounded-xl bg-red-50/50 border border-red-100"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <div className="flex items-center gap-0.5">
                              {Array.from({ length: review.rating }).map((_, i) => (
                                <Star
                                  key={i}
                                  className="w-3.5 h-3.5 fill-red-400 text-red-400"
                                />
                              ))}
                            </div>
                            <span className="text-xs text-gray-400">
                              {formatRelative(review.createdAt)}
                            </span>
                          </div>
                          <span className="text-xs text-gray-500 font-mono">
                            {review.id}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700 leading-relaxed">
                          {review.content}
                        </p>
                        {review.photos && review.photos.length > 0 && (
                          <div className="flex gap-2 mt-3">
                            {review.photos.slice(0, 3).map((p, i) => (
                              <div
                                key={i}
                                className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100"
                              >
                                <img
                                  src={p}
                                  alt={`评价图片 ${i + 1}`}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {providerComplaints.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center shrink-0">
                      <AlertTriangle className="w-4.5 h-4.5 text-amber-500" />
                    </div>
                    <h4 className="text-base font-semibold text-gray-900">投诉记录</h4>
                  </div>
                  <div className="space-y-3">
                    {providerComplaints.map((cmp) => (
                      <div
                        key={cmp.id}
                        className="p-4 rounded-xl bg-amber-50/50 border border-amber-100"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-amber-100 text-amber-700 text-xs font-medium">
                            {cmp.type}
                          </span>
                          <span className="text-xs text-gray-400">
                            {formatDateTime(cmp.createdAt)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700 leading-relaxed">
                          {cmp.content}
                        </p>
                        <div className="mt-3 text-xs text-gray-500">
                          关联订单：<span className="font-mono">{cmp.orderId}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-50">
                <Button
                  variant="ghost"
                  onClick={() => setSelectedProvider(null)}
                >
                  关闭
                </Button>
                <div className="flex-1" />
                {(selectedProvider.status === 'warning' || selectedProvider.complaintCount > 0) && (
                  <>
                    <Button
                      variant="outline"
                      className="text-amber-600 border-amber-200 hover:bg-amber-50"
                      onClick={() => {
                        setSelectedProvider(null);
                        setActionModal({ provider: selectedProvider, action: 'warn' });
                      }}
                    >
                      发送警告
                    </Button>
                    <Button
                      variant="danger"
                      onClick={() => {
                        setSelectedProvider(null);
                        setActionModal({ provider: selectedProvider, action: 'suspend' });
                      }}
                    >
                      下架商家
                    </Button>
                  </>
                )}
                {selectedProvider.status === 'pending' && (
                  <Button
                    variant="secondary"
                    onClick={() => {
                      setSelectedProvider(null);
                      setActionModal({ provider: selectedProvider, action: 'approve' });
                    }}
                  >
                    审核通过
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {actionModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl shadow-card max-w-md w-full animate-scale-in">
            <div className="p-6 border-b border-gray-50">
              <div className="flex items-center gap-4">
                <div
                  className={cn(
                    'w-14 h-14 rounded-2xl flex items-center justify-center',
                    actionModal.action === 'warn' && 'bg-amber-50',
                    actionModal.action === 'suspend' && 'bg-red-50',
                    actionModal.action === 'approve' && 'bg-forest-50'
                  )}
                >
                  {actionModal.action === 'warn' && (
                    <AlertTriangle className="w-7 h-7 text-amber-500" />
                  )}
                  {actionModal.action === 'suspend' && (
                    <Ban className="w-7 h-7 text-red-500" />
                  )}
                  {actionModal.action === 'approve' && (
                    <CheckCircle2 className="w-7 h-7 text-forest-500" />
                  )}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-0.5">
                    {actionModal.action === 'warn' && '发送警告'}
                    {actionModal.action === 'suspend' && '下架商家'}
                    {actionModal.action === 'approve' && '资质审核通过'}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {actionModal.action === 'warn' && '将向该商家发送平台警告通知'}
                    {actionModal.action === 'suspend' && '该商家将被下架，暂停所有服务'}
                    {actionModal.action === 'approve' && '该商家资质审核通过，可正常营业'}
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6">
              <div className="mb-5 p-4 rounded-xl bg-gray-50/70">
                <div className="flex items-center gap-3">
                  <Avatar
                    size="sm"
                    src={(actionModal.provider.user as any)?.avatar}
                    name={actionModal.provider.provider.businessName}
                  />
                  <div>
                    <div className="text-sm font-semibold text-gray-900">
                      {actionModal.provider.provider.businessName}
                    </div>
                    <div className="text-xs text-gray-500">
                      {actionModal.provider.provider.city}
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  处理备注
                </label>
                <textarea
                  value={actionNote}
                  onChange={(e) => setActionNote(e.target.value)}
                  placeholder={
                    actionModal.action === 'warn'
                      ? '填写警告原因...'
                      : actionModal.action === 'suspend'
                      ? '填写下架原因...'
                      : '填写审核意见（可选）'
                  }
                  className="w-full h-28 px-4 py-3 rounded-xl border border-gray-200 bg-gray-50/50 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-brand-200 focus:border-brand-300 transition-all placeholder:text-gray-400 leading-relaxed"
                />
              </div>
            </div>

            <div className="p-6 pt-0 flex gap-3">
              <Button
                fullWidth
                variant="ghost"
                onClick={() => {
                  setActionModal(null);
                  setActionNote('');
                }}
              >
                取消
              </Button>
              <Button
                fullWidth
                variant={
                  actionModal.action === 'suspend'
                    ? 'danger'
                    : actionModal.action === 'approve'
                    ? 'secondary'
                    : 'primary'
                }
                onClick={handleActionConfirm}
              >
                {actionModal.action === 'warn' && '确认警告'}
                {actionModal.action === 'suspend' && '确认下架'}
                {actionModal.action === 'approve' && '确认通过'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {showSuccess && (
        <div className="fixed bottom-6 right-6 z-50 animate-fade-in-up">
          <div className="flex items-center gap-3 px-5 py-3.5 rounded-2xl bg-forest-500 text-white shadow-card">
            <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-semibold">{showSuccess}</div>
              <div className="text-xs text-white/80">操作已生效</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
