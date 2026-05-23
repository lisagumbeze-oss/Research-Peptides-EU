import type { HTMLAttributes } from 'react';
import { cn } from '../../lib/utils';

export type GlassPanelProps = HTMLAttributes<HTMLDivElement> & {
  variant?: 'dark' | 'light';
  padding?: 'none' | 'sm' | 'md' | 'lg';
};

const variantClasses = {
  dark: 'bg-white/5 border-white/10 text-white',
  light: 'bg-white/70 border-brand-200/60 text-navy-950 backdrop-saturate-150',
};

const paddingClasses = {
  none: '',
  sm: 'p-4',
  md: 'p-6 md:p-8',
  lg: 'p-8 md:p-12',
};

export function GlassPanel({
  variant = 'dark',
  padding = 'md',
  className,
  children,
  ...props
}: GlassPanelProps) {
  return (
    <div
      className={cn(
        'rounded-3xl border backdrop-blur-xl shadow-elevated',
        variantClasses[variant],
        paddingClasses[padding],
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
