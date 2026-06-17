import { useState, useMemo } from 'react';
import { Star, MessageCircle } from 'lucide-react';
import type { Review } from '@/types';
import type { User } from '@/types';
import { formatRelative } from '@/utils/date';
import { cn } from '@/lib/utils';

interface ReviewListProps {
  reviews: Review[];
  users: User[];
}

type FilterType = 'all' | 'good' | 'medium' | 'bad';

const filterOptions: { value: FilterType; label: string; range: [number, number] }[] = [
  { value: 'all', label: '全部', range: [1, 5] },
  { value: 'good', label: '好评', range: [4, 5] },
  { value: 'medium', label: '中评', range: [3, 3] },
  { value: 'bad', label: '差评', range: [1, 2] },
];

export default function ReviewList({ reviews, users }: ReviewListProps) {
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');

  const ratingDistribution = useMemo(() => {
    const dist = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach((r) => {
      const rating = Math.max(1, Math.min(5, Math.round(r.rating)));
      dist[rating as keyof typeof dist]++;
    });
    return dist;
  }, [reviews]);

  const totalReviews = reviews.length;
  const averageRating = totalReviews > 0
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews
    : 0;

  const filteredReviews = useMemo(() => {
    const filter = filterOptions.find((f) => f.value === activeFilter);
    if (!filter) return reviews;
    return reviews.filter(
      (r) => r.rating >= filter.range[0] && r.rating <= filter.range[1]
    );
  }, [reviews, activeFilter]);

  const getUserById = (userId: string) => users.find((u) => u.id === userId);

  const renderStars = (rating: number, size: 'sm' | 'md' = 'sm') => {
    const starClass = size === 'sm' ? 'h-3.5 w-3.5' : 'h-5 w-5';
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((i) => (
          <Star
            key={i}
            className={cn(
              starClass,
              i <= rating ? 'fill-amber-400 text-amber-400' : 'fill-gray-200 text-gray-200'
            )}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-5">
      <div className="rounded-3xl bg-white p-5 shadow-soft border border-gray-100">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex flex-col items-center justify-center md:w-48 shrink-0">
            <div className="text-5xl font-bold text-gray-900">{averageRating.toFixed(1)}</div>
            <div className="mt-2">{renderStars(averageRating, 'md')}</div>
            <div className="mt-1 text-sm text-gray-500">共 {totalReviews} 条评价</div>
          </div>

          <div className="flex-1 space-y-2">
            {[5, 4, 3, 2, 1].map((star) => {
              const count = ratingDistribution[star as keyof typeof ratingDistribution];
              const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
              return (
                <div key={star} className="flex items-center gap-3">
                  <div className="flex items-center gap-1 w-12">
                    <span className="text-sm text-gray-600">{star}</span>
                    <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                  </div>
                  <div className="flex-1 h-2.5 rounded-full bg-gray-100 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-amber-400 to-amber-500 transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <div className="w-10 text-right text-sm text-gray-500">{count}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {filterOptions.map((option) => {
          const count =
            option.value === 'all'
              ? reviews.length
              : reviews.filter(
                  (r) => r.rating >= option.range[0] && r.rating <= option.range[1]
                ).length;
          return (
            <button
              key={option.value}
              onClick={() => setActiveFilter(option.value)}
              className={cn(
                'rounded-full px-4 py-2 text-sm font-medium transition-all duration-200',
                activeFilter === option.value
                  ? 'bg-brand-500 text-white shadow-md'
                  : 'bg-white text-gray-600 border border-gray-200 hover:border-brand-300 hover:text-brand-600'
              )}
            >
              {option.label}
              <span className="ml-1.5 text-xs opacity-80">({count})</span>
            </button>
          );
        })}
      </div>

      <div className="space-y-4">
        {filteredReviews.length === 0 ? (
          <div className="rounded-3xl bg-white p-10 text-center shadow-soft border border-gray-100">
            <p className="text-gray-400">暂无符合条件的评价</p>
          </div>
        ) : (
          filteredReviews.map((review) => {
            const user = getUserById(review.ownerId);
            return (
              <div
                key={review.id}
                className="rounded-3xl bg-white p-5 shadow-soft border border-gray-100"
              >
                <div className="flex items-start gap-4">
                  <img
                    src={user?.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=default'}
                    alt={user?.name || '用户'}
                    className="h-11 w-11 rounded-full object-cover shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div>
                        <div className="font-medium text-gray-900">
                          {user?.name || '匿名用户'}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          {renderStars(review.rating)}
                          <span className="text-xs text-gray-400">
                            {formatRelative(review.createdAt)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <p className="mt-3 text-gray-700 leading-relaxed">{review.content}</p>

                    {review.photos && review.photos.length > 0 && (
                      <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                        {review.photos.map((photo, idx) => (
                          <div
                            key={idx}
                            className="relative aspect-square overflow-hidden rounded-xl"
                          >
                            <img
                              src={photo}
                              alt={`评价图片 ${idx + 1}`}
                              className="h-full w-full object-cover hover:scale-105 transition-transform duration-300"
                            />
                          </div>
                        ))}
                      </div>
                    )}

                    {review.reply && (
                      <div className="mt-4 rounded-2xl bg-cream-50 p-4 border border-cream-200">
                        <div className="flex items-center gap-2 mb-2">
                          <MessageCircle className="h-4 w-4 text-brand-500" />
                          <span className="text-sm font-medium text-brand-700">商家回复</span>
                        </div>
                        <p className="text-sm text-gray-700 leading-relaxed">{review.reply}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
