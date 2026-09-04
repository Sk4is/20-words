import React from 'react';
import { motion } from 'motion/react';
import { Sparkles, MessageSquareQuote, ArrowRight } from 'lucide-react';
import { ClientGameState } from '../types/game';
import { useLanguage } from '../i18n/LanguageContext';

interface ClueRevealViewProps {
  gameState: ClientGameState;
  onSkipToDiscussion?: () => void;
}

export const ClueRevealView: React.FC<ClueRevealViewProps> = ({
  gameState,
  onSkipToDiscussion
}) => {
  const { t, tCategory } = useLanguage();
  const activePlayers = gameState.players.filter(p => p.isConnected);
  const localizedCategory = tCategory(gameState.category);

  return (
    <div className="w-full max-w-xl mx-auto px-4 py-6 flex flex-col items-center">
      {/* Header */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[#4cc9f0]/20 border border-[#4cc9f0] text-[#4cc9f0] text-xs font-black uppercase tracking-wider mb-2">
          <Sparkles className="w-3.5 h-3.5" />
          <span>{t('clueReveal.category', { category: localizedCategory.name })}</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-black text-white font-['Outfit'] tracking-tight">
          {t('clueReveal.title')}
        </h2>
        <p className="text-white/80 text-xs sm:text-sm mt-1 font-medium">
          {t('clueReveal.subtitle')}
        </p>
      </div>

      {/* Clues List */}
      <div className="w-full space-y-3 mb-6">
        {activePlayers.map((player, index) => {
          const isMe = player.id === gameState.myPlayerId;
          return (
            <motion.div
              key={player.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.15, duration: 0.3 }}
              className={`p-4 sm:p-5 rounded-3xl border-2 sm:border-4 flex items-center justify-between shadow-xl ${
                isMe
                  ? 'bg-[#2d3282] border-[#4cc9f0] ring-4 ring-[#4cc9f0]/20'
                  : 'bg-[#2d3282] border-[#3e46b1]'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#1a1b4b] border-2 border-[#4cc9f0]/40 flex items-center justify-center font-black text-[#4cc9f0] font-mono text-sm shadow-inner">
                  {player.name.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-black text-sm sm:text-base text-white">
                      {player.name}
                    </span>
                    {isMe && (
                      <span className="text-[10px] uppercase font-bold text-[#4cc9f0] bg-[#4cc9f0]/20 px-1.5 py-0.5 rounded">
                        {t('clueReveal.you')}
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-white/60 font-semibold">{t('clueReveal.clueSubmitted')}</span>
                </div>
              </div>

              {/* The Player's Clue */}
              <div className="flex items-center gap-2 pl-3">
                <MessageSquareQuote className="w-5 h-5 text-[#4cc9f0] shrink-0" />
                <span className="font-mono text-base sm:text-lg font-black text-[#4cc9f0] tracking-wide break-words max-w-[160px] sm:max-w-[220px] text-right">
                  "{player.clue || t('clueReveal.noClue')}"
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Discussion prompt / Next button */}
      <div className="w-full text-center">
        {onSkipToDiscussion && (
          <button
            id="proceed-discussion-btn"
            onClick={onSkipToDiscussion}
            className="w-full py-4 px-6 rounded-2xl bg-[#f72585] hover:brightness-110 text-white font-black text-sm uppercase tracking-widest transition-all active:translate-y-[2px] active:shadow-[0_4px_0_#b5179e] shadow-[0_6px_0_#b5179e] flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>{t('clueReveal.proceedBtn')}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};
