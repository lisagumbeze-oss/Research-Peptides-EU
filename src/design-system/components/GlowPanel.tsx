import type { HTMLAttributes } from 'react';
import { cn } from '../../lib/utils';
import { ScientificBackdrop } from './ScientificBackdrop';

export type GlowPanelProps = HTMLAttributes<HTMLDivElement> & {
  glow?: 'brand' | 'subtle' | 'none';
  /** Grid + molecule micro-pattern (pharma luxury) */
  scientific?: boolean;
};

const glowClasses = {
  brand: 'shadow-glow before:bg-gradient-glow',
  subtle: 'before:bg-gradient-glow before:opacity-50',
  none: '',
};

export function GlowPanel({
  glow = 'brand',
  scientific = false,
  className,
  children,
  ...props
}: GlowPanelProps) {
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-3xl bg-navy-950 text-white',
        glow !== 'none' &&
          'before:pointer-events-none before:absolute before:inset-0 before:z-[1] before:opacity-100',
        glowClasses[glow],
        className,
      )}
      {...props}
    >
      {scientific ? <ScientificBackdrop variant="dark" glow={false} className="z-0" /> : null}
      <div className="relative z-10">{children}</div>
    </div>
  );
}
