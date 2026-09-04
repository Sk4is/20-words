import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Send, CheckCircle2, AlertCircle, EyeOff, Shield } from 'lucide-react';
import { ClientGameState } from '../types/game';
import { WordGrid } from './WordGrid';
import { TimerBar } from './TimerBar';
import { sound } from '../services/sound';
import { useLanguage } from '../i18n/LanguageContext';

interface CluePhaseViewProps {
  gameState: ClientGameState;
  onSubmitClue: (clue: string) => void;
}

export const CluePhaseView: React.FC<CluePhaseViewProps> = ({
  gameState,
  onSubmitClue
}) => {
  const { t, tCategory, tWord } = useLanguage();
  const [clueInput, setClueInput] = useState('');
  const [inputError, setInputError] = useState<string | null>(null);

  const isImpostor = gameState.myRole === 'IMPOSTOR';
  const myPlayer = gameState.players.find(p => p.id === gameState.myPlayerId);
  const alreadySubmitted = Boolean(myPlayer?.clueSubmitted);

  // Character & word count
  const charCount = clueInput.length;
  const wordList = clueInput.trim() ? clueInput.trim().split(/\s+/) : [];
  const wordCount = wordList.length;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (alreadySubmitted) return;

    const trimmed = clueInput.trim();
    if (!trimmed) {
      setInputError(t('cluePhase.errorEmpty'));
      sound.vibrate(50);
      return;
    }
    if (wordCount > 3) {
      setInputError(t('cluePhase.errorMaxWords'));
      sound.vibrate(50);
      return;
    }
    if (trimmed.length > 20) {
      setInputError(t('cluePhase.errorMaxChars'));
      sound.vibrate(50);
      return;
    }

    setInputError(null);
    onSubmitClue(trimmed);
  };

  const submittedCount = gameState.players.filter(p => p.clueSubmitted && p.isConnected).length;
  const totalConnected = gameState.players.filter(p => p.isConnected).length;
  const localizedCategory = tCategory(gameState.category);
  const localizedSecretWord = gameState.secretWord ? tWord(gameState.secretWord) : '';

  return (
    <div className="w-full max-w-4xl mx-auto px-3 sm:px-4 py-4 flex flex-col items-center">
      {/* Category & Round Header */}
      <div className="w-full flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="flex flex-col">
            <span className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-[#4cc9f0]">
              {t('cluePhase.category')}
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-white font-['Outfit'] uppercase tracking-wide">
              {localizedCategory.name}
            </h2>
          </div>
        </div>

        {/* Role Helper Banner */}
        <div
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-2xl text-xs font-extrabold uppercase tracking-wide shadow-md ${
            isImpostor
              ? 'bg-[#f72585] text-white border-2 border-white/20'
              : 'bg-[#4cc9f0] text-[#1a1b4b] border-2 border-white/30'
          }`}
        >
          {isImpostor ? (
            <>
              <EyeOff className="w-4 h-4 text-white" />
              <span>{t('cluePhase.impostorBanner')}</span>
            </>
          ) : (
            <>
              <Shield className="w-4 h-4 text-[#1a1b4b]" />
              <span>{t('cluePhase.innocentBanner')}</span>
            </>
          )}
        </div>
      </div>

      {/* 30-Second Countdown Timer Bar */}
      <div className="w-full mb-4">
        <TimerBar roundEndTimestamp={gameState.roundEndTimestamp} totalDurationSeconds={30} />
      </div>

      {/* 4 x 5 Word Grid */}
      <div className="w-full mb-5">
        <WordGrid
          words={gameState.words}
          secretWord={gameState.secretWord}
          isImpostor={isImpostor}
        />
      </div>

      {/* Clue Input Form / Submission Card (matching Design HTML) */}
      <motion.div
        layout
        className="w-full max-w-2xl bg-[#2d3282] border-4 border-[#3e46b1] rounded-3xl p-5 sm:p-6 shadow-2xl"
      >
        {!alreadySubmitted ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <p className="text-xs font-black text-[#4cc9f0] uppercase tracking-wider mb-0.5">
                  {t('cluePhase.yourRole')}{' '}
                  <span
                    className={`px-2 py-0.5 rounded font-black text-xs ${
                      isImpostor
                        ? 'bg-[#f72585] text-white'
                        : 'bg-[#4cc9f0]/30 text-[#4cc9f0]'
                    }`}
                  >
                    {isImpostor ? t('cluePhase.impostor') : t('cluePhase.innocent')}
                  </span>
                </p>
                <h3 className="text-base sm:text-lg font-black uppercase text-white font-['Outfit']">
                  {isImpostor
                    ? t('cluePhase.writeClueImpostor')
                    : t('cluePhase.writeClueInnocent', { word: localizedSecretWord })}
                </h3>
              </div>

              {/* Connected players submission avatars */}
              <div className="flex -space-x-2 shrink-0">
                {gameState.players.filter(p => p.isConnected).map((p) => (
                  <div
                    key={p.id}
                    title={`${p.name}: ${p.clueSubmitted ? '✓' : '...'}`}
                    className={`w-7 h-7 rounded-full border-2 border-[#2d3282] flex items-center justify-center text-[9px] font-black shadow-md ${
                      p.clueSubmitted
                        ? 'bg-[#4cc9f0] text-[#1a1b4b]'
                        : 'bg-[#1a1b4b] text-white/50'
                    }`}
                  >
                    {p.clueSubmitted ? '✓' : p.name.substring(0, 1).toUpperCase()}
                  </div>
                ))}
              </div>
            </div>

            {inputError && (
              <div className="flex items-center gap-1.5 text-xs text-[#f72585] font-bold bg-[#f72585]/10 border border-[#f72585]/30 p-2 rounded-xl">
                <AlertCircle className="w-4 h-4 shrink-0 text-[#f72585]" />
                <span>{inputError}</span>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3">
              <input
                id="player-clue-input"
                type="text"
                maxLength={20}
                value={clueInput}
                onChange={(e) => {
                  setClueInput(e.target.value);
                  if (inputError) setInputError(null);
                }}
                placeholder={t('cluePhase.inputPlaceholder')}
                className="flex-1 bg-[#1a1b4b] border-2 border-[#4cc9f0]/30 rounded-2xl px-5 py-3.5 text-base sm:text-lg font-bold placeholder:text-white/30 text-white focus:outline-none focus:border-[#4cc9f0] shadow-inner transition"
                autoComplete="off"
                autoFocus
              />

              <button
                id="submit-clue-btn"
                type="submit"
                disabled={!clueInput.trim() || charCount > 20 || wordCount > 3}
                className="bg-[#f72585] hover:brightness-110 disabled:opacity-40 disabled:cursor-not-allowed px-8 py-3.5 rounded-2xl font-black uppercase tracking-widest text-white shadow-[0_6px_0_#b5179e] active:translate-y-[2px] active:shadow-[0_4px_0_#b5179e] transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0"
              >
                <span>{t('cluePhase.submitBtn')}</span>
                <Send className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center justify-between text-xs font-bold text-white/60">
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 bg-[#4cc9f0] rounded-full animate-pulse"></span>
                <span>{t('cluePhase.playersSubmitted', { count: submittedCount, total: totalConnected })}</span>
              </span>
              <span className="font-mono text-white/50">
                {t('cluePhase.charWordLimit', { chars: charCount, words: wordCount })}
              </span>
            </div>
          </form>
        ) : (
          /* Locked Clue Confirmation */
          <div className="flex flex-col items-center justify-center py-3 text-center space-y-2">
            <div className="inline-flex items-center gap-2 px-5 py-2 rounded-2xl bg-[#4cc9f0]/20 border-2 border-[#4cc9f0] text-[#4cc9f0] font-black text-base uppercase tracking-wider shadow-md">
              <CheckCircle2 className="w-5 h-5 text-[#4cc9f0]" />
              <span>{t('cluePhase.submittedBadge')}</span>
            </div>

            {gameState.mySubmittedClue && (
              <div className="text-sm font-bold text-white">
                {t('cluePhase.yourClue', { clue: gameState.mySubmittedClue })}
              </div>
            )}

            <div className="text-xs text-white/70 font-bold">
              {t('cluePhase.waitingOthers', { count: submittedCount, total: totalConnected })}
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};
