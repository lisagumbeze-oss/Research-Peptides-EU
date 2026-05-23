import type { HTMLAttributes } from 'react';
import { cn } from '../../lib/utils';

export type BadgeVariant = 'default' | 'brand' | 'success' | 'warning' | 'purity' | 'outline';

export type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  variant?: BadgeVariant;
};

const variantClasses: Record<BadgeVariant, string> = {
  default: 'bg-slate-850/10 text-steel-600',
  brand: 'bg-brand-100 text-brand-700',
  success: 'bg-success/15 text-success',
  warning: 'bg-warning/15 text-warning',
  purity: 'bg-purity/15 text-purity border border-purity/30',
  outline: 'bg-transparent border border-silver-400/50 text-steel-600',
};

export function Badge({ variant = 'default', className, children, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold tracking-wide uppercase',
        variantClasses[variant],
        className,
      )}
      {...props}
    >
      {children}
    </span>
  );
}
