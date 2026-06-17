import { type ReactNode } from 'react';
import { Package } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EmptyProps {
  title?: string;
  description?: string;
  icon?: ReactNode;
  className?: string;
}

export default function Empty({
  title = '暂无数据',
  description,
  icon,
  className,
}: EmptyProps) {
  return (
    <div className={cn('flex h-full flex-col items-center justify-center gap-3 py-12 text-center', className)}>
      <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center text-gray-400">
        {icon || <Package className="w-8 h-8" />}
      </div>
      <h3 className="text-base font-medium text-gray-700">{title}</h3>
      {description && <p className="text-sm text-gray-400 max-w-xs">{description}</p>}
    </div>
  );
}
