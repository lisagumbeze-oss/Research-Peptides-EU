import type { Transition, Variants } from 'motion/react';
import { motionDuration, motionSpring } from './tokens';

function prefersReducedMotion(): boolean {
  return (
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
}

export const transitions = {
  fast: { duration: motionDuration.fast, ease: 'easeOut' } satisfies Transition,
  base: { duration: motionDuration.base, ease: 'easeOut' } satisfies Transition,
  slow: { duration: motionDuration.slow, ease: 'easeOut' } satisfies Transition,
  spring: { type: 'spring', ...motionSpring } satisfies Transition,
} as const;

/** Fade + slide up — page/section enter */
export function fadeUpVariants(): Variants {
  const reduced = prefersReducedMotion();
  return {
    hidden: { opacity: 0, y: reduced ? 0 : 12 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: motionDuration.base, ease: 'easeOut' },
    },
  };
}

/** @deprecated Use fadeUpVariants() for correct reduced-motion at runtime */
export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: motionDuration.base, ease: 'easeOut' },
  },
};

/** Stagger container for child fadeUp items */
export function staggerContainerVariants(): Variants {
  const reduced = prefersReducedMotion();
  return {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: reduced ? 0 : 0.08,
        delayChildren: reduced ? 0 : 0.05,
      },
    },
  };
}

export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.05 },
  },
};

export const staggerItem: Variants = fadeUp;

/** Card hover — use with whileHover when motion allowed */
export function cardHoverState() {
  const reduced = prefersReducedMotion();
  return {
    scale: reduced ? 1 : 1.02,
    y: reduced ? 0 : -4,
    transition: transitions.fast,
  };
}

export const cardHover = {
  scale: 1.02,
  y: -4,
  transition: transitions.fast,
};

/** Scale in — modals, badges */
export function scaleInVariants(): Variants {
  const reduced = prefersReducedMotion();
  return {
    hidden: { opacity: 0, scale: reduced ? 1 : 0.96 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: transitions.base,
    },
  };
}

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.96 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: transitions.base,
  },
};
