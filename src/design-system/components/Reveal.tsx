import type { ReactNode } from 'react';
import { motion } from 'motion/react';
import { cn } from '../../lib/utils';
import { fadeUpVariants, scaleInVariants } from '../motion';

export type RevealProps = {
  children: ReactNode;
  className?: string;
  /** Stagger delay in seconds */
  delay?: number;
  variant?: 'fadeUp' | 'scaleIn';
  /** Viewport margin passed to whileInView */
  margin?: string;
  as?: 'div' | 'section' | 'article' | 'li';
};

const motionTags = {
  div: motion.div,
  section: motion.section,
  article: motion.article,
  li: motion.li,
} as const;

export function Reveal({
  children,
  className,
  delay = 0,
  variant = 'fadeUp',
  margin = '-48px',
  as = 'div',
}: RevealProps) {
  const Component = motionTags[as];
  const variants = variant === 'scaleIn' ? scaleInVariants() : fadeUpVariants();

  return (
    <Component
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin }}
      variants={variants}
      transition={delay > 0 ? { delay } : undefined}
      className={cn(className)}
    >
      {children}
    </Component>
  );
}
