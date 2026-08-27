import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { accordionMotion } from '../motion';
import { cn } from '../../lib/utils';

type FormErrorProps = {
  message?: string;
  id?: string;
  className?: string;
};

export function FormError({ message, id, className }: FormErrorProps) {
  const reduceMotion = useReducedMotion();
  const motionProps = accordionMotion(Boolean(reduceMotion));

  return (
    <AnimatePresence>
      {message ? (
        <motion.p
          key={message}
          id={id}
          {...motionProps}
          className={cn('text-xs font-semibold text-error', className)}
          role="alert"
        >
          {message}
        </motion.p>
      ) : null}
    </AnimatePresence>
  );
}
