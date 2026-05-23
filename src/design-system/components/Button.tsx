import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { cn } from '../../lib/utils';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline';
export type ButtonSize = 'sm' | 'md' | 'lg';

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
};

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    'bg-gradient-cta text-white shadow-elevated hover:shadow-glow hover:brightness-110 border border-brand-400/30',
  secondary:
    'bg-brand-500 text-white hover:bg-brand-600 shadow-card border border-brand-600/20',
  outline:
    'bg-transparent border-2 border-brand-500 text-brand-600 hover:bg-brand-50',
  ghost:
    'bg-transparent text-brand-400 hover:bg-white/10 hover:text-white',
  danger: 'bg-error text-white hover:brightness-110 shadow-card',
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'h-9 px-4 text-sm rounded-lg',
  md: 'h-11 px-6 text-sm font-semibold rounded-xl',
  lg: 'h-12 px-8 text-base font-semibold rounded-xl',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'primary', size = 'md', fullWidth, className, disabled, type = 'button', children, ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled}
      className={cn(
        'inline-flex items-center justify-center gap-2 transition-all duration-200',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-2',
        'disabled:pointer-events-none disabled:opacity-50',
        'motion-safe:active:scale-[0.98]',
        variantClasses[variant],
        sizeClasses[size],
        fullWidth && 'w-full',
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
});
