import React from 'react';
import { motion } from 'motion/react';
import { Skull, Eye, LogOut, ShieldAlert } from 'lucide-react';
import { ClientGameState } from '../types/game';
import { useLanguage } from '../i18n/LanguageContext';

interface EliminatedPlayerViewProps {
  gameState: ClientGameState;
  onLeaveRoom?: () => void;
}

export const EliminatedPlayerView: React.FC<EliminatedPlayerViewProps> = ({
  gameState,
  onLeaveRoom
}) => {
  const { t, tCategory } = useLanguage();
  const categoryInfo = tCategory(gameState.category);

  return (
    <div className="w-full max-w-2xl mx-auto px-4 py-8 flex flex-col items-center justify-center text-center min-h-[70vh]">
      {/* Big Red Skull & Warning Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.85, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: 'spring', damping: 14, stiffness: 120 }}
        className="w-full bg-[#3a0814] border-4 border-[#ef233c] rounded-3xl p-6 sm:p-10 shadow-[0_0_50px_rgba(239,35,60,0.35)] relative overflow-hidden"
      >
        {/* Glowing Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#ef233c]/20 border-2 border-[#ef233c] text-[#ef233c] text-xs font-black uppercase tracking-widest mb-6">
          <ShieldAlert className="w-4 h-4 text-[#ef233c]" />
          <span>{t('eliminated.badge')}</span>
        </div>

        {/* Big Icon */}
        <div className="w-24 h-24 sm:w-28 sm:h-28 mx-auto mb-6 rounded-3xl bg-[#1f050b] border-4 border-[#ef233c] flex items-center justify-center shadow-[0_0_30px_rgba(239,35,60,0.4)]">
          <Skull className="w-12 h-12 sm:w-16 sm:h-16 text-[#ef233c] animate-pulse" />
        </div>

        {/* Large Text Title */}
        <h1 className="text-3xl sm:text-5xl font-black text-white font-['Outfit'] tracking-tight uppercase mb-3">
          {t('eliminated.title')}
        </h1>

        {/* Subtitle / Reason */}
        <p className="text-base sm:text-lg text-white/90 font-bold max-w-md mx-auto mb-6">
          {t('eliminated.desc')}
        </p>

        {/* Spectator Mode Banner */}
        <div className="w-full bg-[#1f050b]/90 border-2 border-[#ef233c]/40 rounded-2xl p-4 mb-6 text-left flex items-start gap-3.5">
          <div className="w-9 h-9 rounded-xl bg-[#ef233c]/20 border border-[#ef233c]/60 flex items-center justify-center shrink-0 mt-0.5">
            <Eye className="w-5 h-5 text-[#ef233c]" />
          </div>
          <div>
            <h4 className="text-sm font-black text-white uppercase tracking-wide">
              {t('eliminated.spectatorMode')}
            </h4>
            <p className="text-xs sm:text-sm text-white/70 font-medium mt-1">
              {t('eliminated.spectatorHint')}
            </p>
          </div>
        </div>

        {/* Current Round Details */}
        <div className="flex items-center justify-around py-3 px-4 rounded-xl bg-[#1f050b]/60 border border-white/10 text-xs font-mono font-bold text-white/80 mb-6">
          <span>{t('header.category')}: <strong className="text-white font-['Outfit']">{categoryInfo.name}</strong></span>
          <span className="text-[#ef233c]">•</span>
          <span>Ronda: <strong className="text-white font-['Outfit']">#{gameState.roundNumber}</strong></span>
        </div>

        {/* Exit Room Action */}
        {onLeaveRoom && (
          <button
            id="eliminated-leave-room-btn"
            onClick={onLeaveRoom}
            className="w-full sm:w-auto min-w-[220px] py-3.5 px-6 rounded-2xl bg-white/10 hover:bg-[#ef233c] border-2 border-white/20 hover:border-[#ef233c] text-white font-black text-xs uppercase tracking-widest transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer mx-auto shadow-lg"
          >
            <LogOut className="w-4 h-4" />
            <span>{t('eliminated.exitRoom')}</span>
          </button>
        )}
      </motion.div>
    </div>
  );
};
