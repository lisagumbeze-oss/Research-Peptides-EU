import type { HTMLAttributes } from 'react';
import { cn } from '../../lib/utils';

export type GlowPanelProps = HTMLAttributes<HTMLDivElement> & {
  glow?: 'brand' | 'subtle' | 'none';
};

const glowClasses = {
  brand: 'shadow-glow before:bg-gradient-glow',
  subtle: 'before:bg-gradient-glow before:opacity-50',
  none: '',
};

export function GlowPanel({ glow = 'brand', className, children, ...props }: GlowPanelProps) {
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-3xl bg-navy-950 text-white',
        glow !== 'none' &&
          'before:pointer-events-none before:absolute before:inset-0 before:opacity-100',
        glowClasses[glow],
        className,
      )}
      {...props}
    >
      <div className="relative z-10">{children}</div>
    </div>
  );
}
