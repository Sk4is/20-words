import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Sparkles, AlertTriangle } from 'lucide-react';
import { ClientGameState } from '../types/game';
import { WordGrid } from './WordGrid';
import { useLanguage } from '../i18n/LanguageContext';

interface ImpostorGuessViewProps {
  gameState: ClientGameState;
  onSubmitGuess: (word: string) => void;
}

export const ImpostorGuessView: React.FC<ImpostorGuessViewProps> = ({
  gameState,
  onSubmitGuess
}) => {
  const { t, tWord } = useLanguage();
  const [selectedWord, setSelectedWord] = useState<string | null>(null);
  const isImpostor = gameState.myRole === 'IMPOSTOR';
  const impostorName = gameState.impostorName || 'The Impostor';

  const handleConfirmGuess = () => {
    if (!selectedWord || !isImpostor) return;
    onSubmitGuess(selectedWord);
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-6 flex flex-col items-center">
      {/* Alert Header */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center mb-6 max-w-lg"
      >
        <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[#f72585]/20 border-2 border-[#f72585] text-white text-xs font-black uppercase tracking-wider mb-3">
          <AlertTriangle className="w-3.5 h-3.5 text-[#f72585]" />
          <span>{t('impostorGuess.badge')}</span>
        </div>

        {isImpostor ? (
          <div>
            <h2 className="text-3xl sm:text-4xl font-black text-[#f72585] font-['Outfit'] tracking-tight">
              {t('impostorGuess.youCaughtTitle')}
            </h2>
            <p className="text-white text-sm sm:text-base font-bold mt-2">
              {t('impostorGuess.youCaughtDesc')}
            </p>
            <p className="text-white/70 text-xs mt-1 font-medium">
              {t('impostorGuess.selectWordHint')}
            </p>
          </div>
        ) : (
          <div>
            <h2 className="text-3xl sm:text-4xl font-black text-white font-['Outfit'] tracking-tight">
              {t('impostorGuess.otherCaughtTitle', { name: impostorName })}
            </h2>
            <p className="text-white/80 text-sm sm:text-base mt-2 font-medium">
              {t('impostorGuess.otherCaughtDesc')}
            </p>
          </div>
        )}
      </motion.div>

      {/* 4 x 5 Word Grid */}
      <div className="w-full mb-6">
        <WordGrid
          words={gameState.words}
          secretWord={undefined} // Keep secret hidden from view during guess
          isImpostor={true}
          isSelectable={isImpostor}
          selectedWord={selectedWord}
          onSelectWord={(word) => setSelectedWord(word)}
        />
      </div>

      {/* Submission Card (Impostor only) */}
      {isImpostor ? (
        <div className="w-full max-w-md">
          <button
            id="confirm-impostor-guess-btn"
            disabled={!selectedWord}
            onClick={handleConfirmGuess}
            className="w-full py-4 px-6 rounded-2xl bg-[#f72585] hover:brightness-110 disabled:opacity-40 disabled:cursor-not-allowed text-white font-black text-base uppercase tracking-widest transition-all active:translate-y-[2px] active:shadow-[0_4px_0_#b5179e] shadow-[0_6px_0_#b5179e] flex items-center justify-center gap-2 cursor-pointer"
          >
            <Sparkles className="w-5 h-5 fill-white" />
            <span>
              {selectedWord
                ? t('impostorGuess.guessBtn', { word: tWord(selectedWord).toUpperCase() })
                : t('impostorGuess.selectFromGrid')}
            </span>
          </button>
        </div>
      ) : (
        <div className="p-4 rounded-3xl bg-[#2d3282] border-4 border-[#3e46b1] text-center text-xs text-[#4cc9f0] font-black uppercase tracking-wider animate-pulse shadow-xl">
          {t('impostorGuess.waitingForGuess', { name: impostorName })}
        </div>
      )}
    </div>
  );
};
