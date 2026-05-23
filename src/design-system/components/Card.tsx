import type { HTMLAttributes } from 'react';
import { cn } from '../../lib/utils';

export type CardVariant = 'default' | 'product' | 'feature' | 'trust';

export type CardProps = HTMLAttributes<HTMLDivElement> & {
  variant?: CardVariant;
  interactive?: boolean;
};

const variantClasses: Record<CardVariant, string> = {
  default: 'bg-white border border-silver-400/25 shadow-card rounded-2xl',
  product:
    'bg-white border border-silver-400/20 shadow-card rounded-2xl overflow-hidden group',
  feature:
    'bg-mist-50 border border-brand-100 rounded-2xl p-6 shadow-card',
  trust: 'bg-white border border-silver-400/40 rounded-2xl p-6 text-navy-950',
};

const interactiveClasses =
  'motion-safe:transition-all motion-safe:duration-300 motion-safe:hover:-translate-y-1 motion-safe:hover:shadow-elevated motion-safe:hover:border-brand-300/50 cursor-pointer';

export function Card({
  variant = 'default',
  interactive = false,
  className,
  children,
  ...props
}: CardProps) {
  return (
    <div
      className={cn(variantClasses[variant], interactive && interactiveClasses, className)}
      {...props}
    >
      {children}
    </div>
  );
}
