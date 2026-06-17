import { type HTMLAttributes } from 'react';
import { User } from 'lucide-react';
import { cn } from '@/lib/utils';

type AvatarSize = 'sm' | 'md' | 'lg' | 'xl';

interface AvatarProps extends HTMLAttributes<HTMLDivElement> {
  src?: string;
  name?: string;
  size?: AvatarSize;
}

const sizeStyles: Record<AvatarSize, string> = {
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-14 h-14 text-base',
  xl: 'w-20 h-20 text-xl',
};

const gradients = [
  'from-brand-400 to-brand-600',
  'from-forest-400 to-forest-600',
  'from-pink-400 to-pink-600',
  'from-purple-400 to-purple-600',
  'from-blue-400 to-blue-600',
  'from-teal-400 to-teal-600',
];

const getGradient = (name: string): string => {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return gradients[Math.abs(hash) % gradients.length];
};

const getInitial = (name: string): string => {
  const trimmed = name.trim();
  if (!trimmed) return '?';
  return trimmed.charAt(0).toUpperCase();
};

export default function Avatar({
  src,
  name = '',
  size = 'md',
  className,
  ...props
}: AvatarProps) {
  const gradient = name ? getGradient(name) : gradients[0];
  const initial = getInitial(name);

  return (
    <div
      className={cn(
        'relative inline-flex items-center justify-center rounded-full overflow-hidden bg-gray-100 ring-2 ring-white flex-shrink-0',
        sizeStyles[size],
        className
      )}
      {...props}
    >
      {src ? (
        <img
          src={src}
          alt={name || 'avatar'}
          className="w-full h-full object-cover"
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).style.display = 'none';
          }}
        />
      ) : name ? (
        <span
          className={cn(
            'w-full h-full flex items-center justify-center font-semibold text-white bg-gradient-to-br',
            gradient
          )}
        >
          {initial}
        </span>
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-300 to-gray-400">
          <User className={cn('text-white', size === 'sm' || size === 'md' ? 'w-4 h-4' : 'w-6 h-6')} />
        </div>
      )}
    </div>
  );
}
