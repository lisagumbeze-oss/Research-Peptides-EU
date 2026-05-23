import type { ReactNode } from 'react';
import { cn } from '../../lib/utils';

type SectionHeadingProps = {
  eyebrow: string;
  title: ReactNode;
  description?: string;
  align?: 'left' | 'center';
  light?: boolean;
  className?: string;
};

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = 'left',
  light = false,
  className,
}: SectionHeadingProps) {
  return (
    <div
      className={cn(
        align === 'center' && 'text-center mx-auto max-w-3xl',
        className,
      )}
    >
      <p
        className={cn(
          'text-caption mb-3',
          light ? 'text-brand-300' : 'text-brand-600',
        )}
      >
        {eyebrow}
      </p>
      <h2
        className={cn(
          'text-h2 font-display font-bold mb-4',
          light ? 'text-white' : 'text-navy-950',
        )}
      >
        {title}
      </h2>
      {description ? (
        <p
          className={cn(
            'text-body-lg max-w-2xl',
            align === 'center' && 'mx-auto',
            light ? 'text-silver-400' : 'text-steel-600',
          )}
        >
          {description}
        </p>
      ) : null}
    </div>
  );
}
