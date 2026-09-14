import type { ReactNode } from 'react';
import { cn } from '../../lib/utils';

type AnswerCapsuleProps = {
  title: string;
  children: ReactNode;
  className?: string;
  /** Optional id for aria / deep links */
  id?: string;
};

/** Short factual block for GEO / AI answer extraction — one idea, plain language. */
export function AnswerCapsule({ title, children, className, id }: AnswerCapsuleProps) {
  return (
    <aside
      id={id}
      className={cn(
        'rounded-r-2xl border border-brand-100 border-l-4 border-l-brand-500 bg-brand-50/90 p-5 md:p-6 shadow-sm',
        className,
      )}
      data-rp-answer-capsule="1"
    >
      <p className="font-display font-bold text-navy-950 text-base md:text-lg mb-2">{title}</p>
      <div className="text-sm md:text-[0.95rem] text-steel-700 leading-relaxed space-y-2">{children}</div>
    </aside>
  );
}
