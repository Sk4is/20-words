import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { DoorOpen, AlertTriangle } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';

interface ConfirmLeaveModalProps {
  isOpen: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export const ConfirmLeaveModal: React.FC<ConfirmLeaveModalProps> = ({
  isOpen,
  onCancel,
  onConfirm
}) => {
  const { t } = useLanguage();

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div
        id="confirm-leave-backdrop"
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
        onClick={onCancel}
      >
        <motion.div
          id="confirm-leave-dialog"
          initial={{ opacity: 0, scale: 0.9, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 10 }}
          transition={{ duration: 0.15, ease: 'easeOut' }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-sm bg-[#2d3282] border-4 border-[#3e46b1] rounded-3xl p-6 text-center shadow-2xl relative overflow-hidden"
        >
          {/* Visual Header Accent */}
          <div className="mx-auto w-14 h-14 rounded-2xl bg-rose-500/20 border-2 border-rose-500/50 flex items-center justify-center text-rose-400 mb-4 shadow-inner">
            <DoorOpen className="w-7 h-7 text-rose-400" />
          </div>

          {/* Title */}
          <h2
            id="confirm-leave-title"
            className="text-2xl font-black text-white font-['Outfit'] tracking-wide uppercase mb-2"
          >
            {t('confirmLeave.title') || '¿Salir de la sala?'}
          </h2>

          {/* Subtitle / Warning */}
          <p
            id="confirm-leave-message"
            className="text-white/80 text-sm font-medium mb-6 leading-relaxed"
          >
            {t('confirmLeave.message') || 'Abandonarás esta partida.'}
          </p>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <button
              id="confirm-leave-cancel-btn"
              type="button"
              onClick={onCancel}
              className="py-3 px-4 rounded-2xl bg-white/10 hover:bg-white/20 active:bg-white/25 text-white font-black uppercase text-sm tracking-wider border-2 border-white/20 transition active:scale-95 cursor-pointer font-['Outfit']"
            >
              {t('confirmLeave.cancel') || 'CANCELAR'}
            </button>

            <button
              id="confirm-leave-confirm-btn"
              type="button"
              onClick={onConfirm}
              className="py-3 px-4 rounded-2xl bg-rose-600 hover:bg-rose-500 active:bg-rose-700 text-white font-black uppercase text-sm tracking-wider shadow-[0_4px_0_#9f1239] active:shadow-[0_2px_0_#9f1239] active:translate-y-[2px] transition cursor-pointer border-2 border-rose-400/40 font-['Outfit'] flex items-center justify-center gap-1.5"
            >
              <DoorOpen className="w-4 h-4" />
              <span>{t('confirmLeave.confirm') || 'SALIR'}</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
