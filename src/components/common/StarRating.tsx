import { useState } from 'react';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

type StarRatingSize = 'sm' | 'md' | 'lg';

interface StarRatingProps {
  value: number;
  onChange?: (value: number) => void;
  size?: StarRatingSize;
  showValue?: boolean;
  className?: string;
}

const sizeStyles: Record<StarRatingSize, { star: string; text: string; gap: string }> = {
  sm: { star: 'w-4 h-4', text: 'text-xs', gap: 'gap-0.5' },
  md: { star: 'w-5 h-5', text: 'text-sm', gap: 'gap-1' },
  lg: { star: 'w-6 h-6', text: 'text-base', gap: 'gap-1.5' },
};

export default function StarRating({
  value,
  onChange,
  size = 'md',
  showValue = false,
  className,
}: StarRatingProps) {
  const [hoverValue, setHoverValue] = useState<number | null>(null);
  const editable = typeof onChange === 'function';
  const displayValue = hoverValue !== null ? hoverValue : value;
  const styles = sizeStyles[size];

  const handleClick = (index: number) => {
    if (editable) {
      onChange(index);
    }
  };

  const handleMouseEnter = (index: number) => {
    if (editable) {
      setHoverValue(index);
    }
  };

  const handleMouseLeave = () => {
    if (editable) {
      setHoverValue(null);
    }
  };

  return (
    <div
      className={cn(
        'inline-flex items-center',
        styles.gap,
        editable && 'cursor-pointer',
        className
      )}
      onMouseLeave={handleMouseLeave}
    >
      {[1, 2, 3, 4, 5].map((index) => {
        const filled = index <= displayValue;
        const halfFilled = !filled && index - 0.5 <= displayValue;
        return (
          <button
            key={index}
            type="button"
            onClick={() => handleClick(index)}
            onMouseEnter={() => handleMouseEnter(index)}
            disabled={!editable}
            className={cn(
              'relative transition-transform',
              editable && 'hover:scale-110 focus:outline-none',
              !editable && 'cursor-default'
            )}
          >
            <Star
              className={cn(
                styles.star,
                'transition-colors',
                filled
                  ? 'text-brand-500 fill-brand-500'
                  : halfFilled
                  ? 'text-brand-500'
                  : 'text-gray-300'
              )}
              style={
                halfFilled
                  ? {
                      background: `linear-gradient(to right, #FF8C42 50%, transparent 50%)`,
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text',
                    }
                  : undefined
              }
            />
          </button>
        );
      })}
      {showValue && (
        <span className={cn('ml-2 font-medium text-gray-700', styles.text)}>
          {value.toFixed(1)}
        </span>
      )}
    </div>
  );
}
