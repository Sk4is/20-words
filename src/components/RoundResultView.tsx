import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Trophy, EyeOff, Sparkles, ArrowRight, Grid, ChevronDown, ChevronUp, LogOut } from 'lucide-react';
import { ClientGameState } from '../types/game';
import { WordGrid } from './WordGrid';
import { useLanguage } from '../i18n/LanguageContext';

interface RoundResultViewProps {
  gameState: ClientGameState;
  onNextRound: () => void;
  onLeaveRoom?: () => void;
}

export const RoundResultView: React.FC<RoundResultViewProps> = ({
  gameState,
  onNextRound,
  onLeaveRoom
}) => {
  const { t, tCategory, tWord } = useLanguage();
  const [showFullGrid, setShowFullGrid] = useState(false);
  const myPlayer = gameState.players.find(p => p.id === gameState.myPlayerId);
  const isHost = Boolean(myPlayer?.isHost);

  const isImpostorWin = gameState.winner === 'IMPOSTOR';
  const impostorPlayer = gameState.players.find(p => p.id === gameState.impostorId);
  const impostorName = impostorPlayer?.name || 'Unknown';

  const localizedCategory = tCategory(gameState.category);
  const localizedSecretWord = gameState.secretWord ? tWord(gameState.secretWord) : '';

  // Winner banner text
  let winTitle = t('roundResult.innocentsWinTitle');
  let winSubtitle = t('roundResult.innocentsWinSubtitle');
  if (isImpostorWin) {
    if (gameState.winReason === 'IMPOSTOR_GUESSED_WORD') {
      winTitle = t('roundResult.impostorGuessedTitle');
      winSubtitle = t('roundResult.impostorGuessedSubtitle', {
        name: impostorName,
        word: localizedSecretWord
      });
    } else {
      winTitle = t('roundResult.impostorNotCaughtTitle');
      winSubtitle = t('roundResult.impostorNotCaughtSubtitle', { name: impostorName });
    }
  }

  // Sorted players by score
  const sortedPlayers = [...gameState.players].sort((a, b) => b.score - a.score);

  return (
    <div className="w-full max-w-2xl mx-auto px-4 py-6 flex flex-col items-center">
      {/* Winner Hero Banner */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', damping: 15 }}
        className={`w-full text-center p-6 sm:p-8 rounded-3xl border-4 shadow-2xl mb-6 relative overflow-hidden bg-[#2d3282] ${
          isImpostorWin
            ? 'border-[#f72585] shadow-[#f72585]/30'
            : 'border-[#4cc9f0] shadow-[#4cc9f0]/30'
        }`}
      >
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#1a1b4b] border-2 border-white/20 mb-3 shadow-inner">
          <Trophy className={`w-8 h-8 ${isImpostorWin ? 'text-[#f72585]' : 'text-[#4cc9f0]'}`} />
        </div>

        <h1 className="text-3xl sm:text-5xl font-black text-white font-['Outfit'] tracking-tight">
          {winTitle}
        </h1>
        <p className="text-sm sm:text-base text-white/80 font-bold mt-2 max-w-md mx-auto">
          {winSubtitle}
        </p>
      </motion.div>

      {/* Elimination Result Badge */}
      {gameState.eliminatedOption && (
        <div className="w-full mb-6 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-[#1a1b4b] border-2 border-white/20 text-white text-xs sm:text-sm font-bold shadow-lg">
            <span>🗳️</span>
            <span>
              {gameState.eliminatedOption === 'NOBODY'
                ? (t('voting.nobodyEliminated') || 'Nadie fue eliminado en la votación')
                : (t('voting.playerEliminated', { name: gameState.eliminatedName || '' }) || `${gameState.eliminatedName} fue eliminado por la mayoría de votos`)}
            </span>
          </div>
        </div>
      )}

      {/* Identity & Secret Word Reveal Card */}
      <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
        {/* The Impostor */}
        <div className="p-4 sm:p-5 rounded-3xl bg-[#2d3282] border-4 border-[#f72585]/60 flex items-center gap-3.5 shadow-xl">
          <div className="w-12 h-12 rounded-2xl bg-[#f72585]/20 border-2 border-[#f72585] flex items-center justify-center shrink-0">
            <EyeOff className="w-6 h-6 text-[#f72585]" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] font-black uppercase tracking-widest text-[#f72585] block">
              {t('roundResult.impostorWas')}
            </span>
            <span className="text-lg sm:text-xl font-black text-white truncate block font-['Outfit']">
              {impostorName}
            </span>
            {gameState.impostorGuess && (
              <span className="text-xs text-[#f72585] font-mono block truncate font-bold">
                {t('roundResult.guessed', { guess: tWord(gameState.impostorGuess) })}
              </span>
            )}
          </div>
        </div>

        {/* The Secret Word */}
        <div className="p-4 sm:p-5 rounded-3xl bg-[#2d3282] border-4 border-[#4cc9f0]/60 flex items-center gap-3.5 shadow-xl">
          <div className="w-12 h-12 rounded-2xl bg-[#4cc9f0]/20 border-2 border-[#4cc9f0] flex items-center justify-center shrink-0">
            <Sparkles className="w-6 h-6 text-[#4cc9f0]" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] font-black uppercase tracking-widest text-[#4cc9f0] block">
              {t('roundResult.secretWordWas')}
            </span>
            <span className="text-lg sm:text-xl font-black text-[#4cc9f0] truncate block font-['Outfit']">
              {localizedSecretWord || 'Unknown'}
            </span>
            <span className="text-xs text-white/70 block font-medium">
              {t('roundResult.category', { category: localizedCategory.name })}
            </span>
          </div>
        </div>
      </div>

      {/* Clues and Votes Summary */}
      <div className="w-full bg-[#2d3282] border-4 border-[#3e46b1] rounded-3xl p-5 sm:p-6 shadow-2xl mb-6">
        <h3 className="text-sm font-black text-[#4cc9f0] uppercase tracking-wider mb-3">
          {t('roundResult.summaryTitle')}
        </h3>

        <div className="space-y-2">
          {gameState.players.map((player) => {
            const isImp = player.id === gameState.impostorId;
            const points = gameState.pointsAwarded?.[player.id] || 0;

            return (
              <div
                key={player.id}
                className={`p-3 sm:p-3.5 rounded-2xl border-2 flex items-center justify-between text-xs sm:text-sm ${
                  isImp
                    ? 'bg-[#1a1b4b] border-[#f72585]'
                    : 'bg-[#1a1b4b]/80 border-white/10'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="font-black text-white truncate">{player.name}</span>
                  {isImp ? (
                    <span className="text-[9px] font-black uppercase text-white bg-[#f72585] px-2 py-0.5 rounded shadow">
                      {t('roundResult.impostorBadge')}
                    </span>
                  ) : (
                    <span className="text-[9px] font-bold uppercase text-white/70 bg-white/10 px-1.5 py-0.5 rounded">
                      {t('roundResult.innocentBadge')}
                    </span>
                  )}
                  <span className="text-[#4cc9f0] font-mono font-bold truncate">
                    "{player.clue || t('roundResult.noClue')}"
                  </span>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs text-white/60 font-semibold">
                    {t('roundResult.voteCount', { count: player.voteCount || 0 })}
                  </span>
                  {points > 0 && (
                    <span className="text-xs font-black text-[#1a1b4b] bg-[#4cc9f0] px-2.5 py-0.5 rounded-full shadow">
                      {t('roundResult.ptsAwarded', { points })}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Review 20 Words Grid Collapsible */}
      <div className="w-full mb-6">
        <button
          type="button"
          onClick={() => setShowFullGrid(!showFullGrid)}
          className="w-full py-3 px-4 rounded-2xl bg-[#2d3282] hover:bg-[#2d3282]/80 border-2 border-[#3e46b1] text-white text-xs font-bold flex items-center justify-between transition cursor-pointer shadow-md"
        >
          <span className="flex items-center gap-2">
            <Grid className="w-4 h-4 text-[#4cc9f0]" />
            <span>{showFullGrid ? t('roundResult.hideGrid') : t('roundResult.reviewGrid')}</span>
          </span>
          {showFullGrid ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {showFullGrid && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="pt-3"
          >
            <WordGrid
              words={gameState.words}
              secretWord={gameState.secretWord}
              isImpostor={false}
              showAllAtResult={true}
              impostorGuess={gameState.impostorGuess}
            />
          </motion.div>
        )}
      </div>

      {/* Scoreboard */}
      <div className="w-full bg-[#2d3282] border-4 border-[#3e46b1] rounded-3xl p-5 shadow-2xl mb-6">
        <div className="flex items-center justify-between mb-3 pb-2 border-b border-white/10">
          <span className="text-xs font-black uppercase tracking-widest text-[#4cc9f0]">
            {t('roundResult.scoreboardTitle')}
          </span>
          <span className="text-xs text-white/50 font-mono font-bold">
            {t('roundResult.roundComplete', { round: gameState.roundNumber })}
          </span>
        </div>

        <div className="space-y-1.5">
          {sortedPlayers.map((player, rank) => (
            <div
              key={player.id}
              className="flex items-center justify-between p-2.5 rounded-xl hover:bg-white/5 transition text-xs sm:text-sm"
            >
              <div className="flex items-center gap-2.5">
                <span className="font-mono font-black text-[#4cc9f0] w-4 text-center">
                  #{rank + 1}
                </span>
                <span className="font-extrabold text-white">{player.name}</span>
                {player.id === gameState.myPlayerId && (
                  <span className="text-[9px] uppercase font-bold text-[#4cc9f0] bg-[#4cc9f0]/20 px-1.5 py-0.5 rounded">
                    {t('roundResult.you')}
                  </span>
                )}
              </div>
              <span className="font-mono font-black text-[#4cc9f0] text-sm">
                {t('roundResult.scorePts', { score: player.score })}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Next Round & Exit Room Actions */}
      <div className="w-full max-w-md space-y-3">
        {isHost ? (
          <button
            id="next-round-btn"
            onClick={onNextRound}
            className="w-full py-4 px-6 rounded-2xl bg-[#f72585] hover:brightness-110 text-white font-black text-base uppercase tracking-widest transition-all active:translate-y-[2px] active:shadow-[0_4px_0_#b5179e] shadow-[0_6px_0_#b5179e] flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>{t('roundResult.nextRoundBtn')}</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        ) : (
          <div className="p-4 rounded-3xl bg-[#2d3282] border-4 border-[#3e46b1] text-center text-xs font-bold text-white/70 shadow-xl">
            {t('roundResult.waitingHostNextRound')}
          </div>
        )}

        {onLeaveRoom && (
          <button
            id="result-leave-room-btn"
            onClick={onLeaveRoom}
            className="w-full py-3.5 px-6 rounded-2xl bg-[#1a1b4b] hover:bg-[#1a1b4b]/80 border-2 border-white/20 hover:border-[#f72585] text-white font-black text-xs uppercase tracking-widest transition-all active:translate-y-[1px] flex items-center justify-center gap-2 cursor-pointer shadow-md"
          >
            <LogOut className="w-4 h-4 text-white/70" />
            <span>{t('roundResult.exitBtn') || t('header.leaveRoom')}</span>
          </button>
        )}
      </div>
    </div>
  );
};
