import React from 'react';
import { motion } from 'motion/react';
import { Sparkles, CheckCircle2 } from 'lucide-react';

interface WordGridProps {
  words: string[];
  secretWord?: string; // Only provided if player is Innocent OR round result
  isImpostor: boolean;
  isSelectable?: boolean;
  selectedWord?: string | null;
  onSelectWord?: (word: string) => void;
  impostorGuess?: string | null;
  showAllAtResult?: boolean;
}

export const WordGrid: React.FC<WordGridProps> = ({
  words,
  secretWord,
  isImpostor,
  isSelectable = false,
  selectedWord = null,
  onSelectWord,
  impostorGuess = null,
  showAllAtResult = false
}) => {
  return (
    <div className="w-full">
      {/* 4 columns x 5 rows grid */}
      <div className="grid grid-cols-4 grid-rows-5 gap-1.5 sm:gap-2.5 w-full max-w-4xl mx-auto select-none">
        {words.map((word, index) => {
          const isSecret = Boolean(secretWord && word.toLowerCase() === secretWord.toLowerCase());
          const isSelectedByPlayer = Boolean(selectedWord && word.toLowerCase() === selectedWord.toLowerCase());
          const isImpostorChoice = Boolean(impostorGuess && word.toLowerCase() === impostorGuess.toLowerCase());

          // An Innocent sees the highlight. Impostor only sees it if round is over (showAllAtResult).
          const highlightSecret = isSecret && (!isImpostor || showAllAtResult);

          return (
            <motion.button
              key={`${word}-${index}`}
              id={`word-card-${index}`}
              type="button"
              disabled={!isSelectable}
              onClick={() => {
                if (isSelectable && onSelectWord) {
                  onSelectWord(word);
                }
              }}
              whileHover={isSelectable ? { scale: 1.03 } : {}}
              whileTap={isSelectable ? { scale: 0.97 } : {}}
              className={`relative min-h-[52px] sm:min-h-[64px] md:min-h-[72px] px-2 py-2 rounded-2xl flex flex-col items-center justify-center text-center font-bold text-xs sm:text-sm md:text-base transition-all duration-200 uppercase tracking-tight ${
                highlightSecret
                  ? 'bg-[#4cc9f0] border-4 border-white text-[#1a1b4b] font-black shadow-[0_0_30px_rgba(76,201,240,0.5)] ring-4 ring-[#4cc9f0]/30 z-10'
                  : isSelectedByPlayer
                  ? 'bg-[#f72585] border-4 border-white text-white font-black shadow-[0_0_30px_rgba(247,37,133,0.5)] ring-4 ring-[#f72585]/30 z-10'
                  : isImpostorChoice && !isSecret
                  ? 'bg-white/10 text-[#f72585] line-through border-2 border-[#f72585]/60'
                  : 'bg-white/10 border-2 border-white/10 hover:bg-white/20 text-white'
              } ${
                isSelectable
                  ? 'cursor-pointer hover:border-[#4cc9f0] active:scale-95'
                  : 'cursor-default'
              }`}
            >
              {/* Secret Word Badge from Design HTML */}
              {highlightSecret && (
                <div className="absolute -top-3 bg-white text-[#4cc9f0] text-[8px] sm:text-[9px] font-black px-2 py-0.5 rounded-full shadow-md tracking-wider">
                  SECRET WORD
                </div>
              )}

              {/* Selected by Impostor during Guess */}
              {isSelectedByPlayer && isSelectable && (
                <div className="absolute -top-3 bg-white text-[#f72585] text-[8px] sm:text-[9px] font-black px-2 py-0.5 rounded-full shadow-md tracking-wider">
                  YOUR GUESS
                </div>
              )}

              {/* Word Text */}
              <span className="leading-tight tracking-tight break-words max-w-full">
                {word}
              </span>

              {/* If Impostor guessed this word incorrectly */}
              {isImpostorChoice && !isSecret && showAllAtResult && (
                <span className="text-[8px] sm:text-[9px] font-bold tracking-tight text-[#f72585] mt-0.5">
                  IMPOSTOR GUESS
                </span>
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};
