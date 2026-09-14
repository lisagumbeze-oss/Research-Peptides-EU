import { useToastStore } from '../store/useToastStore';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { CheckCircle, XCircle, Info, X } from 'lucide-react';

export default function ToastContainer() {
  const { toasts, removeToast } = useToastStore();
  const reduceMotion = useReducedMotion();

  return (
    <div className="fixed z-[100] bottom-above-mobile-nav md:bottom-8 right-4 left-4 md:left-auto md:right-8 flex flex-col gap-3 max-w-md w-auto md:w-[380px] ml-auto">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            role="status"
            initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 8 }}
            transition={reduceMotion ? { duration: 0 } : { duration: 0.22, ease: 'easeOut' }}
            className={`
              flex items-center p-4 rounded-2xl shadow-2xl border backdrop-blur-md
              ${toast.type === 'success' ? 'bg-white/90 border-green-100 text-green-900' : ''}
              ${toast.type === 'error' ? 'bg-white/90 border-red-100 text-red-900' : ''}
              ${toast.type === 'info' ? 'bg-white/90 border-brand-100 text-navy-900' : ''}
            `}
          >
            <div className="flex-shrink-0 mr-3">
              {toast.type === 'success' && <CheckCircle className="h-6 w-6 text-green-500" aria-hidden />}
              {toast.type === 'error' && <XCircle className="h-6 w-6 text-red-500" aria-hidden />}
              {toast.type === 'info' && <Info className="h-6 w-6 text-brand-500" aria-hidden />}
            </div>
            <p className="text-sm font-bold flex-grow">{toast.message}</p>
            <button
              type="button"
              onClick={() => removeToast(toast.id)}
              className="ml-4 text-gray-400 hover:text-gray-900 transition-colors"
              aria-label="Dismiss notification"
            >
              <X className="h-4 w-4" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
