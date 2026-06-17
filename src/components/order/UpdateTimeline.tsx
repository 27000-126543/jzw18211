import { ImageIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Update } from '@/types';
import { formatRelative } from '@/utils/date';

interface UpdateTimelineProps {
  updates: Update[];
}

export default function UpdateTimeline({ updates }: UpdateTimelineProps) {
  const sortedUpdates = [...updates].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  if (sortedUpdates.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-soft border border-gray-100 p-8 text-center animate-fade-in-up">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-cream-100 flex items-center justify-center">
          <ImageIcon className="w-8 h-8 text-brand-400" />
        </div>
        <h3 className="text-base font-medium text-gray-700 mb-1">暂无寄养动态</h3>
        <p className="text-sm text-gray-400">服务开始后会更新宠物的状态哦~</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-soft border border-gray-100 p-6 animate-fade-in-up">
      <h3 className="text-base font-semibold text-gray-900 mb-6">寄养动态</h3>

      <div className="relative">
        <div className="absolute left-[15px] top-2 bottom-2 w-0.5 bg-gradient-to-b from-brand-200 via-brand-100 to-transparent" />

        <div className="space-y-6">
          {sortedUpdates.map((update, index) => {
            const imgCount = update.images?.length || 0;

            return (
              <div
                key={update.id}
                className={cn(
                  'relative flex items-start gap-4',
                  index === 0 ? 'animate-slide-in-right' : ''
                )}
              >
                <div
                  className={cn(
                    'relative z-10 w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-1',
                    index === 0
                      ? 'bg-brand-500 text-white shadow-md shadow-brand-500/30'
                      : 'bg-cream-100 text-brand-500'
                  )}
                >
                  <div className="w-3 h-3 rounded-full bg-white" />
                </div>

                <div
                  className={cn(
                    'flex-1 bg-gradient-to-br rounded-xl p-4 border',
                    index === 0
                      ? 'from-brand-50 to-white border-brand-100'
                      : 'from-gray-50 to-white border-gray-100'
                  )}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-gray-400">
                      {formatRelative(update.createdAt)}
                    </span>
                    {index === 0 && (
                      <span className="px-2 py-0.5 bg-brand-100 text-brand-700 text-xs font-medium rounded-full">
                        最新
                      </span>
                    )}
                  </div>

                  <p className="text-sm text-gray-700 leading-relaxed mb-3">
                    {update.content}
                  </p>

                  {imgCount > 0 && (
                    <div
                      className={cn(
                        'grid gap-2',
                        imgCount === 1 ? 'grid-cols-1 max-w-xs' : 'grid-cols-2',
                        imgCount >= 3 ? 'grid-cols-3' : ''
                      )}
                    >
                      {update.images!.slice(0, 3).map((img, imgIdx) => (
                        <div
                          key={imgIdx}
                          className={cn(
                            'relative aspect-square rounded-lg overflow-hidden bg-gray-100',
                            imgCount === 1
                              ? 'aspect-[4/3]'
                              : 'aspect-square'
                          )}
                        >
                          <img
                            src={img}
                            alt={`寄养动态 ${index + 1}-${imgIdx + 1}`}
                            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
