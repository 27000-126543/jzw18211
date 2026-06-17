import { useState } from 'react';
import { Star, ImagePlus, X, Send, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/store';

interface ReviewFormProps {
  orderId: string;
  providerId: string;
  onSubmit?: () => void;
  isProvider?: boolean;
}

const RATING_LABELS = ['', '很差', '较差', '一般', '满意', '非常满意'];

export default function ReviewForm({
  orderId,
  providerId,
  onSubmit,
  isProvider = false,
}: ReviewFormProps) {
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [content, setContent] = useState('');
  const [anonymous, setAnonymous] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [images, setImages] = useState<string[]>([]);

  const currentUser = useAppStore((s) => s.currentUser);
  const addReview = useAppStore((s) => s.addReview);

  const MAX_IMAGES = 6;
  const MAX_CONTENT = 300;

  const handleAddImage = () => {
    if (images.length < MAX_IMAGES) {
      const placeholders = [
        'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=400',
        'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=400',
        'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=400',
        'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=400',
        'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=400',
        'https://images.unsplash.com/photo-1560743641-3914f2c45636?w=400',
      ];
      setImages([
        ...images,
        placeholders[images.length % placeholders.length],
      ]);
    }
  };

  const handleRemoveImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    if (rating === 0 || content.trim().length === 0) return;

    addReview({
      orderId,
      reviewerId: currentUser?.id || 'anonymous',
      providerId,
      rating,
      content: content.trim(),
      images,
    });

    setSubmitted(true);
    onSubmit?.();
  };

  if (submitted) {
    return (
      <div className="bg-white rounded-2xl shadow-soft border border-gray-100 p-8 text-center animate-fade-in-up">
        <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-brand-50 flex items-center justify-center animate-bounce-soft">
          <CheckCircle2 className="w-12 h-12 text-brand-500" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">评价提交成功</h3>
        <p className="text-sm text-gray-500">
          感谢您的评价，您的反馈对我们很重要！
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-soft border border-gray-100 p-6 animate-fade-in-up">
      <h3 className="text-base font-semibold text-gray-900 mb-6">
        {isProvider ? '评价宠物主人' : '评价寄养服务'}
      </h3>

      <div className="mb-6">
        <div className="text-sm font-medium text-gray-700 mb-3">服务评分</div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            {[1, 2, 3, 4, 5].map((val) => {
              const active = (hoverRating || rating) >= val;
              return (
                <button
                  key={val}
                  type="button"
                  onMouseEnter={() => setHoverRating(val)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => setRating(val)}
                  className="transition-transform hover:scale-110 focus:outline-none"
                >
                  <Star
                    className={cn(
                      'w-8 h-8 transition-colors',
                      active
                        ? 'fill-amber-400 text-amber-400'
                        : 'fill-gray-100 text-gray-200'
                    )}
                  />
                </button>
              );
            })}
          </div>
          <div className="text-sm font-medium text-brand-600">
            {RATING_LABELS[rating]}
          </div>
        </div>
      </div>

      <div className="mb-5">
        <div className="flex items-center justify-between mb-2">
          <div className="text-sm font-medium text-gray-700">文字评价</div>
          <div
            className={cn(
              'text-xs',
              content.length >= MAX_CONTENT ? 'text-red-500' : 'text-gray-400'
            )}
          >
            {content.length}/{MAX_CONTENT}
          </div>
        </div>
        <textarea
          value={content}
          onChange={(e) =>
            setContent(e.target.value.slice(0, MAX_CONTENT))
          }
          placeholder={
            isProvider
              ? '说说与宠物主人的合作体验...'
              : '分享您的寄养体验，帮助其他用户做出更好的选择...'
          }
          className={cn(
            'w-full h-28 px-4 py-3 rounded-xl border text-sm resize-none',
            'focus:outline-none focus:ring-2 focus:ring-brand-200 focus:border-brand-300 transition-all',
            'border-gray-200 bg-gray-50/50 placeholder:text-gray-400'
          )}
        />
      </div>

      <div className="mb-5">
        <div className="text-sm font-medium text-gray-700 mb-3">
          上传图片（最多{MAX_IMAGES}张）
        </div>
        <div className="grid grid-cols-3 gap-2.5">
          {images.map((img, index) => (
            <div
              key={index}
              className="relative aspect-square rounded-lg overflow-hidden bg-gray-100 group"
            >
              <img
                src={img}
                alt={`评价图片 ${index + 1}`}
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={() => handleRemoveImage(index)}
                className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
          {images.length < MAX_IMAGES && (
            <button
              type="button"
              onClick={handleAddImage}
              className={cn(
                'aspect-square rounded-lg border-2 border-dashed flex flex-col items-center justify-center gap-1.5',
                'border-gray-200 bg-gray-50/50 text-gray-400 hover:border-brand-300 hover:bg-brand-50/30 hover:text-brand-500',
                'transition-all'
              )}
            >
              <ImagePlus className="w-6 h-6" />
              <span className="text-xs">添加图片</span>
            </button>
          )}
        </div>
      </div>

      <div className="mb-6 flex items-center gap-2.5">
        <button
          type="button"
          onClick={() => setAnonymous(!anonymous)}
          className={cn(
            'w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-all',
            anonymous
              ? 'bg-brand-500 border-brand-500'
              : 'border-gray-300 hover:border-gray-400'
          )}
        >
          {anonymous && (
            <svg
              className="w-3 h-3 text-white"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          )}
        </button>
        <span className="text-sm text-gray-600">匿名评价</span>
      </div>

      <button
        type="button"
        onClick={handleSubmit}
        disabled={rating === 0 || content.trim().length === 0}
        className={cn(
          'w-full flex items-center justify-center gap-2 py-3.5 rounded-xl',
          'bg-brand-500 text-white text-base font-semibold',
          'hover:bg-brand-600 active:bg-brand-700 transition-colors',
          'shadow-float disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-brand-500'
        )}
      >
        <Send className="w-5 h-5" />
        <span>提交评价</span>
      </button>
    </div>
  );
}
