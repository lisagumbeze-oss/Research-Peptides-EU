import type { ReactNode } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { stepPanelMotion } from '../../design-system/motion';

type CheckoutStepPanelProps = {
  children: ReactNode;
  className?: string;
};

export function CheckoutStepPanel({ children, className }: CheckoutStepPanelProps) {
  const reduceMotion = useReducedMotion();
  const panel = stepPanelMotion(Boolean(reduceMotion));

  return (
    <motion.div className={className} {...panel}>
      {children}
    </motion.div>
  );
}
