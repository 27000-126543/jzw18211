import { type InputHTMLAttributes, forwardRef, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value'> {
  label?: string;
  error?: string;
  helperText?: string;
  prefixIcon?: ReactNode;
  suffixIcon?: ReactNode;
  value: string | number;
  onChange: (value: string) => void;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      helperText,
      prefixIcon,
      suffixIcon,
      className,
      value,
      onChange,
      disabled,
      id,
      ...props
    },
    ref
  ) => {
    const inputId = id || `input-${label?.replace(/\s/g, '-').toLowerCase()}`;

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-gray-700 mb-1.5"
          >
            {label}
          </label>
        )}
        <div className="relative">
          {prefixIcon && (
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
              {prefixIcon}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            disabled={disabled}
            className={cn(
              'w-full h-12 rounded-2xl border border-gray-200 bg-white',
              'px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400',
              'transition-all duration-200 outline-none',
              'focus:border-brand-400 focus:ring-4 focus:ring-brand-100',
              error &&
                'border-red-400 focus:border-red-400 focus:ring-red-100',
              disabled && 'bg-gray-50 text-gray-500 cursor-not-allowed',
              prefixIcon && 'pl-11',
              suffixIcon && 'pr-11',
              className
            )}
            {...props}
          />
          {suffixIcon && (
            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
              {suffixIcon}
            </div>
          )}
        </div>
        {(error || helperText) && (
          <p
            className={cn(
              'mt-1.5 text-xs',
              error ? 'text-red-500' : 'text-gray-500'
            )}
          >
            {error || helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
