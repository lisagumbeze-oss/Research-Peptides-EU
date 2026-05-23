import React from 'react';
import { useToastStore } from '../store/useToastStore';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle, XCircle, Info, X } from 'lucide-react';

export default function ToastContainer() {
  const { toasts, removeToast } = useToastStore();

  return (
    <div className="fixed bottom-8 right-8 z-[100] flex flex-col gap-3 max-w-md w-full sm:w-[380px]">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 50, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
            className={`
              flex items-center p-4 rounded-2xl shadow-2xl border backdrop-blur-md
              ${toast.type === 'success' ? 'bg-white/90 border-green-100 text-green-900' : ''}
              ${toast.type === 'error' ? 'bg-white/90 border-red-100 text-red-900' : ''}
              ${toast.type === 'info' ? 'bg-white/90 border-brand-100 text-navy-900' : ''}
            `}
          >
            <div className="flex-shrink-0 mr-3">
              {toast.type === 'success' && <CheckCircle className="h-6 w-6 text-green-500" />}
              {toast.type === 'error' && <XCircle className="h-6 w-6 text-red-500" />}
              {toast.type === 'info' && <Info className="h-6 w-6 text-brand-500" />}
            </div>
            <p className="text-sm font-bold flex-grow">{toast.message}</p>
            <button 
              onClick={() => removeToast(toast.id)}
              className="ml-4 text-gray-400 hover:text-gray-900 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
