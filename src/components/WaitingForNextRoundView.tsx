import React from 'react';
import { motion } from 'motion/react';
import { Hourglass, Users, LogOut, Sparkles } from 'lucide-react';
import { ClientGameState } from '../types/game';
import { useLanguage } from '../i18n/LanguageContext';

interface WaitingForNextRoundViewProps {
  gameState: ClientGameState;
  onLeaveRoom: () => void;
}

export const WaitingForNextRoundView: React.FC<WaitingForNextRoundViewProps> = ({
  gameState,
  onLeaveRoom
}) => {
  const { t, tCategory } = useLanguage();
  const localizedCategory = gameState.category ? tCategory(gameState.category) : null;
  const activePlayers = gameState.players.filter(p => p.status !== 'eliminated' && !p.waitingForNextRound);
  const eliminatedPlayers = gameState.players.filter(p => p.status === 'eliminated');

  return (
    <div className="w-full max-w-lg mx-auto px-4 py-8 flex flex-col items-center select-none">
      <motion.div
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', damping: 15 }}
        className="w-full text-center p-6 sm:p-8 rounded-3xl bg-[#2d3282] border-4 border-[#f72585] shadow-2xl mb-6 relative overflow-hidden"
      >
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#1a1b4b] border-2 border-white/20 mb-4 shadow-inner">
          <Hourglass className="w-8 h-8 text-[#f72585] animate-pulse" />
        </div>

        <div className="inline-block px-3 py-1 rounded-full bg-[#f72585]/20 border border-[#f72585]/40 text-[#f72585] text-xs font-black uppercase tracking-widest mb-2">
          {t('waiting.badge') || 'PARTIDA EN CURSO'}
        </div>

        <h1 className="text-2xl sm:text-4xl font-black text-white font-['Outfit'] tracking-tight uppercase">
          {t('waiting.title') || 'PARTIDA EN CURSO'}
        </h1>
        <p className="text-white/80 text-sm sm:text-base font-bold mt-2 max-w-sm mx-auto">
          {t('waiting.subtitle') || 'Te reincorporarás en la siguiente ronda.'}
        </p>

        <div className="mt-5 p-3.5 rounded-2xl bg-[#1a1b4b]/80 border border-white/10 text-xs text-white/70 font-medium">
          {t('waiting.description') || 'Has entrado a la sala mientras hay una ronda en curso. Puedes observar la partida y participarás automáticamente cuando comience la próxima ronda.'}
        </div>
      </motion.div>

      {/* Room Information Card */}
      <div className="w-full bg-[#2d3282] border-4 border-[#3e46b1] rounded-3xl p-5 shadow-xl mb-6 space-y-3">
        <div className="flex items-center justify-between text-xs sm:text-sm border-b border-white/10 pb-3">
          <span className="text-white/60 font-bold uppercase tracking-wider">{t('game.room') || 'SALA'}</span>
          <span className="font-mono font-black text-white bg-[#1a1b4b] px-3 py-1 rounded-lg border border-white/10">
            {gameState.roomCode}
          </span>
        </div>

        {localizedCategory && (
          <div className="flex items-center justify-between text-xs sm:text-sm border-b border-white/10 pb-3">
            <span className="text-white/60 font-bold uppercase tracking-wider">{t('game.category') || 'CATEGORÍA'}</span>
            <span className="font-black text-[#4cc9f0] flex items-center gap-1.5">
              <Sparkles className="w-4 h-4" />
              {localizedCategory.name}
            </span>
          </div>
        )}

        <div className="flex items-center justify-between text-xs sm:text-sm">
          <span className="text-white/60 font-bold uppercase tracking-wider">{t('game.round') || 'RONDA'}</span>
          <span className="font-black text-white">#{gameState.roundNumber}</span>
        </div>
      </div>

      {/* Players in Round List */}
      <div className="w-full bg-[#2d3282] border-4 border-[#3e46b1] rounded-3xl p-5 shadow-xl mb-6">
        <div className="flex items-center gap-2 mb-3 text-xs font-black uppercase text-[#4cc9f0] tracking-wider">
          <Users className="w-4 h-4" />
          <span>{t('waiting.playersInRound') || 'Jugadores en la partida'} ({activePlayers.length} activos)</span>
        </div>

        <div className="space-y-2">
          {gameState.players.map((p) => {
            const isElim = p.status === 'eliminated';
            const isWaiting = p.waitingForNextRound;
            return (
              <div
                key={p.id}
                className={`p-3 rounded-2xl border flex items-center justify-between text-xs sm:text-sm ${
                  isElim
                    ? 'bg-[#1a1b4b]/40 border-red-500/30 text-white/50'
                    : isWaiting
                    ? 'bg-[#1a1b4b]/80 border-amber-500/30 text-white/80'
                    : 'bg-[#1a1b4b] border-white/10 text-white'
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  <span className="font-black truncate">{p.name}</span>
                  {p.isHost && (
                    <span className="text-[9px] font-bold uppercase bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded border border-amber-400/30">
                      HOST
                    </span>
                  )}
                  {p.id === gameState.myPlayerId && (
                    <span className="text-[9px] font-bold uppercase bg-[#4cc9f0]/20 text-[#4cc9f0] px-1.5 py-0.5 rounded border border-[#4cc9f0]/30">
                      TÚ
                    </span>
                  )}
                </div>

                <div className="shrink-0">
                  {isElim ? (
                    <span className="text-[10px] font-bold text-red-400 uppercase tracking-wider">
                      {t('voting.eliminated') || 'ELIMINADO'}
                    </span>
                  ) : isWaiting ? (
                    <span className="text-[10px] font-bold text-amber-300 uppercase tracking-wider">
                      {t('waiting.spectating') || 'ESPECTADOR'}
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">
                      {t('waiting.playing') || 'JUGANDO'}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Leave Room Button */}
      <button
        type="button"
        onClick={onLeaveRoom}
        className="px-6 py-3 rounded-2xl bg-white/10 hover:bg-white/20 active:bg-white/5 text-white/80 hover:text-white font-black text-xs uppercase tracking-wider flex items-center gap-2 border border-white/20 transition-all cursor-pointer"
      >
        <LogOut className="w-4 h-4" />
        <span>{t('header.leave') || 'SALIR DE LA SALA'}</span>
      </button>
    </div>
  );
};
