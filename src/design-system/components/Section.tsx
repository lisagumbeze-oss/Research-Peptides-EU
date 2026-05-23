import type { HTMLAttributes } from 'react';
import { cn } from '../../lib/utils';

export type SectionProps = HTMLAttributes<HTMLElement> & {
  size?: 'sm' | 'md' | 'lg';
  tone?: 'light' | 'dark' | 'mist';
};

const sizeClasses = {
  sm: 'section-sm',
  md: 'section-md',
  lg: 'section-lg',
};

const toneClasses = {
  light: 'bg-mist-50 text-navy-950',
  dark: 'bg-navy-950 text-white',
  mist: 'bg-white text-navy-950',
};

export function Section({
  size = 'md',
  tone = 'light',
  className,
  children,
  ...props
}: SectionProps) {
  return (
    <section className={cn(sizeClasses[size], toneClasses[tone], className)} {...props}>
      {children}
    </section>
  );
}
