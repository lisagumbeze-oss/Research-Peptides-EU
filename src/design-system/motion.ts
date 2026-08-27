import type { Transition, Variants } from 'motion/react';
import { motionDuration, motionSpring } from './tokens';

export function prefersReducedMotion(): boolean {
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

export function instantOr(transition: Transition, reduced = prefersReducedMotion()): Transition {
  return reduced ? { duration: 0 } : transition;
}

/** Fade + slide up — page/section enter */
export function fadeUpVariants(): Variants {
  const reduced = prefersReducedMotion();
  return {
    hidden: { opacity: 0, y: reduced ? 0 : 12 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: reduced ? 0 : motionDuration.base, ease: 'easeOut' },
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

export function staggerItemVariants(): Variants {
  return fadeUpVariants();
}

/** @deprecated Use staggerItemVariants() */
export const staggerItem: Variants = fadeUp;

/** Card hover — use with whileHover when motion allowed */
export function cardHoverState() {
  const reduced = prefersReducedMotion();
  return {
    scale: reduced ? 1 : 1.015,
    y: reduced ? 0 : -4,
    transition: transitions.fast,
  };
}

export const cardHover = {
  scale: 1.015,
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
      transition: reduced ? { duration: 0 } : transitions.base,
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

type OverlayMotion = {
  initial: { opacity: number };
  animate: { opacity: number };
  exit: { opacity: number };
  transition: Transition;
};

/** Backdrop / overlay fade */
export function overlayMotion(reduced = prefersReducedMotion()): OverlayMotion {
  const transition = reduced ? { duration: 0 } : transitions.fast;
  return {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition,
  };
}

type PanelMotion = {
  initial: { x?: string; opacity: number };
  animate: { x?: number; opacity: number };
  exit: { x?: string; opacity: number };
  transition: Transition;
};

/** Slide-in panel from the right; fades only when reduced-motion is on */
export function slideFromRightMotion(reduced = prefersReducedMotion()): PanelMotion {
  if (reduced) {
    return {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 },
      transition: { duration: 0.12 },
    };
  }
  return {
    initial: { x: '100%', opacity: 1 },
    animate: { x: 0, opacity: 1 },
    exit: { x: '100%', opacity: 1 },
    transition: { type: 'spring', damping: 28, stiffness: 280 },
  };
}

type DropMotion = {
  initial: { opacity: number; y: number };
  animate: { opacity: number; y: number };
  exit: { opacity: number; y: number };
  transition: Transition;
};

/** Mega-menu / dropdown enter */
export function dropDownMotion(reduced = prefersReducedMotion()): DropMotion {
  return {
    initial: { opacity: 0, y: reduced ? 0 : -8 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: reduced ? 0 : -8 },
    transition: reduced ? { duration: 0 } : { duration: 0.2, ease: 'easeOut' },
  };
}

type ModalMotion = {
  initial: { opacity: number; scale: number; y: number };
  animate: { opacity: number; scale: number; y: number };
  exit: { opacity: number; scale: number; y: number };
  transition: Transition;
};

/** Centered dialog / search panel */
export function modalMotion(reduced = prefersReducedMotion()): ModalMotion {
  return {
    initial: { opacity: 0, scale: reduced ? 1 : 0.97, y: reduced ? 0 : -12 },
    animate: { opacity: 1, scale: 1, y: 0 },
    exit: { opacity: 0, scale: reduced ? 1 : 0.97, y: reduced ? 0 : -12 },
    transition: reduced ? { duration: 0 } : { duration: 0.22, ease: 'easeOut' },
  };
}

type ToastMotion = {
  initial: { opacity: number; y?: number };
  animate: { opacity: number; y?: number };
  exit: { opacity: number; y?: number };
  transition: Transition;
};

/** Bottom toast / sales popover — fade only when reduced-motion is on */
export function toastMotion(reduced = prefersReducedMotion()): ToastMotion {
  if (reduced) {
    return overlayMotion(true);
  }
  return {
    initial: { opacity: 0, y: 16 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 8 },
    transition: { duration: 0.22, ease: 'easeOut' },
  };
}

type AccordionMotion = {
  initial: { opacity: number; y: number };
  animate: { opacity: number; y: number };
  exit: { opacity: number; y: number };
  transition: Transition;
};

/** Expand/collapse content — opacity + translate only, never height */
export function accordionMotion(reduced = prefersReducedMotion()): AccordionMotion {
  return {
    initial: { opacity: 0, y: reduced ? 0 : -6 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: reduced ? 0 : -6 },
    transition: reduced ? { duration: 0 } : transitions.fast,
  };
}

type StepPanelMotion = {
  initial: { opacity: number; y: number };
  animate: { opacity: number; y: number };
  exit: { opacity: number; y: number };
  transition: Transition;
};

/** Checkout / wizard step change — opacity + translate only */
export function stepPanelMotion(reduced = prefersReducedMotion()): StepPanelMotion {
  return {
    initial: { opacity: 0, y: reduced ? 0 : 12 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: reduced ? 0 : -8 },
    transition: reduced ? { duration: 0 } : transitions.fast,
  };
}

/** Cap grid stagger so large catalogs don't trickle in */
export function staggerDelay(index: number, step = 0.04, cap = 7): number {
  if (prefersReducedMotion()) return 0;
  return Math.min(index, cap) * step;
}
