import type { HTMLAttributes } from 'react';
import { cn } from '../../lib/utils';

export type ScientificBackdropProps = HTMLAttributes<HTMLDivElement> & {
  variant?: 'dark' | 'light';
  grid?: boolean;
  molecule?: boolean;
  glow?: boolean;
};

/** Layered scientific grid + molecule pattern for hero, catalog headers, footer. */
export function ScientificBackdrop({
  variant = 'dark',
  grid = true,
  molecule = true,
  glow = false,
  className,
  ...props
}: ScientificBackdropProps) {
  const gridOpacity = variant === 'dark' ? 'opacity-20' : 'opacity-30';
  const moleculeOpacity = variant === 'dark' ? 'opacity-[0.14]' : 'opacity-[0.08]';
  const glowOpacity = variant === 'dark' ? 'opacity-60' : 'opacity-40';

  return (
    <div
      className={cn('absolute inset-0 pointer-events-none overflow-hidden', className)}
      aria-hidden
      {...props}
    >
      {grid ? <div className={cn('absolute inset-0 bg-scientific-grid', gridOpacity)} /> : null}
      {molecule ? (
        <div className={cn('absolute inset-0 bg-scientific-molecule', moleculeOpacity)} />
      ) : null}
      {glow ? (
        <div className={cn('absolute inset-0 bg-gradient-glow', glowOpacity)} />
      ) : null}
    </div>
  );
}
