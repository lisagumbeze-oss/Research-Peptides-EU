import { motion, useReducedMotion } from 'motion/react';
import { cn } from '../../lib/utils';

export type CountBadgeProps = {
  count: number;
  className?: string;
};

/** Cart/count indicator with a short pop when the number changes. */
export function CountBadge({ count, className }: CountBadgeProps) {
  const reduce = useReducedMotion();
  if (count <= 0) return null;

  const label = count > 99 ? '99+' : String(count);

  return (
    <motion.span
      key={label}
      initial={reduce ? false : { scale: 0.7, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={reduce ? { duration: 0 } : { type: 'spring', stiffness: 520, damping: 22 }}
      className={cn(
        'absolute -top-0.5 -right-0.5 min-w-[1.125rem] h-[1.125rem] px-0.5',
        'bg-brand-500 text-white text-[10px] font-bold rounded-full',
        'flex items-center justify-center tabular-nums',
        className,
      )}
      aria-hidden
    >
      {label}
    </motion.span>
  );
}
