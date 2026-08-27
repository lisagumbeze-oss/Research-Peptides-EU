import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react';
import { cn } from '../../lib/utils';
import { FormError } from './FormError';

export type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  hint?: string;
  error?: string;
  startAdornment?: ReactNode;
};

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, hint, error, startAdornment, className, id, ...props },
  ref,
) {
  const inputId = id ?? (label ? label.replace(/\s+/g, '-').toLowerCase() : undefined);

  return (
    <div className="w-full space-y-1.5">
      {label && (
        <label htmlFor={inputId} className="text-caption text-steel-600 block">
          {label}
        </label>
      )}
      <div className="relative">
        {startAdornment && (
          <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-silver-400">
            {startAdornment}
          </div>
        )}
        <input
          ref={ref}
          id={inputId}
          {...props}
          aria-invalid={error ? true : undefined}
          aria-describedby={error && inputId ? `${inputId}-error` : undefined}
          className={cn(
            'w-full h-11 rounded-xl border bg-white px-4 text-navy-950 text-sm',
            'border-silver-400/40 placeholder:text-silver-400/80',
            'transition-[border-color,box-shadow,background-color] duration-200',
            'focus:outline-none focus:ring-2 focus:ring-brand-400/50 focus:border-brand-500',
            'disabled:cursor-not-allowed disabled:opacity-50',
            error && 'border-error focus:ring-error/40 focus:border-error',
            startAdornment && 'pl-10',
            className,
          )}
        />
      </div>
      <FormError message={error} id={inputId ? `${inputId}-error` : undefined} />
      {hint && !error ? <p className="text-xs text-silver-400">{hint}</p> : null}
    </div>
  );
});
