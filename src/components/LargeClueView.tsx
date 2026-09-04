import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown, Eye } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';

interface LargeClueViewProps {
  clue: string;
  isOpen: boolean;
  onMinimize: () => void;
}

export const LargeClueView: React.FC<LargeClueViewProps> = ({
  clue,
  isOpen,
  onMinimize
}) => {
  const { t } = useLanguage();

  const formattedClue = (clue || '').trim();
  const displayClue = formattedClue || t('game.noClueSubmitted');

  // Dynamic responsive typography scale based on length & word count
  const fontSizeClass = useMemo(() => {
    const len = displayClue.length;
    const words = displayClue.split(/\s+/).filter(Boolean);

    if (len <= 6 && words.length <= 1) {
      return 'text-6xl xs:text-7xl sm:text-8xl md:text-9xl';
    }
    if (len <= 11 && words.length <= 2) {
      return 'text-5xl sm:text-7xl md:text-8xl';
    }
    if (len <= 16) {
      return 'text-4xl sm:text-5xl md:text-7xl';
    }
    return 'text-3xl sm:text-4xl md:text-6xl';
  }, [displayClue]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          id="large-clue-presentation"
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.96 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 bg-[#070818] text-white flex flex-col justify-between p-4 sm:p-8 select-none"
        >
          {/* Top Bar - Minimal Header with Quick Minimize */}
          <div className="w-full flex items-center justify-between">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/15">
              <Eye className="w-4 h-4 text-[#4cc9f0]" />
              <span className="text-xs font-bold uppercase tracking-widest text-[#4cc9f0]">
                {t('largeClue.badge') || 'Tu Pista'}
              </span>
            </div>

            <button
              id="large-clue-top-minimize"
              type="button"
              onClick={onMinimize}
              className="px-4 py-2 rounded-2xl bg-white/10 hover:bg-white/20 active:bg-white/30 border border-white/20 text-white font-bold text-xs sm:text-sm uppercase tracking-wider flex items-center gap-1.5 cursor-pointer transition-colors shadow-lg"
            >
              <span>{t('largeClue.minimize') || 'Minimizar'}</span>
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>

          {/* Center Clue Presentation - High Contrast, Giant Typography */}
          <div
            className="flex-1 flex flex-col items-center justify-center px-2 sm:px-6 my-auto text-center"
            onClick={onMinimize}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', damping: 18, stiffness: 200, delay: 0.05 }}
              className="w-full max-w-4xl mx-auto flex items-center justify-center cursor-pointer"
            >
              <h1
                id="large-clue-text"
                className={`${fontSizeClass} font-black font-['Outfit'] uppercase tracking-wider text-white text-center leading-tight break-words max-w-full drop-shadow-[0_4px_30px_rgba(76,201,240,0.5)]`}
              >
                {displayClue}
              </h1>
            </motion.div>

            <p className="text-xs sm:text-sm font-semibold text-white/50 mt-6 tracking-wide">
              {t('largeClue.showScreenPrompt') || 'Muestra esta pantalla al resto del grupo'}
            </p>
          </div>

          {/* Bottom Bar - Clear Exit Control */}
          <div className="w-full max-w-md mx-auto pt-2 pb-1">
            <button
              id="large-clue-bottom-minimize"
              type="button"
              onClick={onMinimize}
              className="w-full py-4 px-6 rounded-2xl bg-[#4361ee] hover:bg-[#3a56d4] active:bg-[#2f46b0] text-white font-black text-base sm:text-lg uppercase tracking-wide flex items-center justify-center gap-2 shadow-xl shadow-[#4361ee]/30 transition-all cursor-pointer border-2 border-white/20"
            >
              <span>{t('largeClue.minimizeAndVote') || 'Minimizar y Votar'}</span>
              <ChevronDown className="w-5 h-5" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
