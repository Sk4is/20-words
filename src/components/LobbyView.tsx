import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Crown, CheckCircle2, Circle, Copy, Check, Users, Play, Sparkles, Clock } from 'lucide-react';
import { ClientGameState } from '../types/game';
import { sound } from '../services/sound';
import { useLanguage } from '../i18n/LanguageContext';

interface LobbyViewProps {
  gameState: ClientGameState;
  onToggleReady: () => void;
  onStartGame: () => void;
  onSetClueDuration?: (duration: number) => void;
}

export const LobbyView: React.FC<LobbyViewProps> = ({
  gameState,
  onToggleReady,
  onStartGame,
  onSetClueDuration
}) => {
  const { t } = useLanguage();
  const [copied, setCopied] = useState(false);
  const myPlayer = gameState.players.find(p => p.id === gameState.myPlayerId);
  const activePlayers = gameState.players.filter(p => p.isConnected);
  const connectedCount = activePlayers.length;

  const minPlayers = 3;
  const maxPlayers = 6;
  const hasEnoughPlayers = connectedCount >= minPlayers;
  const allReady = hasEnoughPlayers && activePlayers.every(p => p.isReady);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(gameState.roomCode).catch(() => {});
    setCopied(true);
    sound.playPop();
    setTimeout(() => setCopied(false), 2000);
  };

  const missingPlayers = minPlayers - connectedCount;
  const currentDuration = gameState.clueDuration || 30;

  const [sliderDuration, setSliderDuration] = useState<number>(currentDuration);
  const isDraggingRef = React.useRef(false);
  const debounceTimerRef = React.useRef<NodeJS.Timeout | null>(null);

  React.useEffect(() => {
    if (!isDraggingRef.current) {
      setSliderDuration(gameState.clueDuration || 30);
    }
  }, [gameState.clueDuration]);

  React.useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  return (
    <div className="w-full max-w-xl mx-auto px-4 py-6 flex flex-col items-center">
      {/* Room Code Card */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full bg-[#2d3282] border-4 border-[#3e46b1] rounded-3xl p-5 text-center shadow-2xl mb-6 relative overflow-hidden"
      >
        <div className="text-xs font-black uppercase tracking-widest text-[#4cc9f0] mb-1">
          {t('lobby.roomCode')}
        </div>
        <div className="flex items-center justify-center gap-3">
          <span className="font-mono text-4xl sm:text-5xl font-black text-white tracking-wider font-['Outfit']">
            {gameState.roomCode}
          </span>
          <button
            id="lobby-copy-code-btn"
            onClick={handleCopyCode}
            aria-label={t('lobby.copyCode')}
            className="p-3 rounded-2xl bg-[#1a1b4b] border-2 border-[#4cc9f0]/40 hover:border-[#4cc9f0] text-white transition active:scale-95 shadow-inner cursor-pointer"
            title={t('lobby.copyCode')}
          >
            {copied ? (
              <Check className="w-5 h-5 text-[#4cc9f0]" />
            ) : (
              <Copy className="w-5 h-5 text-white/80" />
            )}
          </button>
        </div>
        <p className="text-xs text-white/70 mt-2 font-medium">
          {t('lobby.shareHint')}
        </p>
      </motion.div>

      {/* Clue Timer Configuration (Host Configurable 10-120s) */}
      <div className="w-full bg-[#2d3282] border-4 border-[#3e46b1] rounded-3xl p-5 shadow-2xl mb-6">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-[#4cc9f0]" />
            <h3 className="font-black text-sm sm:text-base text-white font-['Outfit'] tracking-wide uppercase">
              {t('lobby.clueTimer')}
            </h3>
          </div>
          <span className="px-3 py-1 rounded-full bg-[#1a1b4b] text-[#4cc9f0] text-sm font-black border border-[#4cc9f0]/40 font-mono shadow-inner">
            {sliderDuration}s
          </span>
        </div>

        {myPlayer?.isHost ? (
          <div>
            <div className="mb-2">
              <input
                id="lobby-clue-duration-slider"
                type="range"
                min={10}
                max={120}
                step={5}
                value={sliderDuration}
                onPointerDown={() => {
                  isDraggingRef.current = true;
                }}
                onPointerUp={(e) => {
                  isDraggingRef.current = false;
                  const val = Number((e.target as HTMLInputElement).value);
                  if (debounceTimerRef.current) {
                    clearTimeout(debounceTimerRef.current);
                  }
                  onSetClueDuration?.(val);
                }}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setSliderDuration(val);
                  if (debounceTimerRef.current) {
                    clearTimeout(debounceTimerRef.current);
                  }
                  debounceTimerRef.current = setTimeout(() => {
                    onSetClueDuration?.(val);
                  }, 250);
                }}
                className="w-full accent-[#4cc9f0] h-2 bg-[#1a1b4b] rounded-lg cursor-pointer"
              />
            </div>

            {/* Quick preset buttons */}
            <div className="flex items-center justify-between gap-1.5 mt-3">
              {[15, 30, 45, 60, 90].map((sec) => (
                <button
                  key={sec}
                  type="button"
                  onClick={() => {
                    if (debounceTimerRef.current) {
                      clearTimeout(debounceTimerRef.current);
                    }
                    setSliderDuration(sec);
                    onSetClueDuration?.(sec);
                  }}
                  className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-mono font-black transition cursor-pointer ${
                    sliderDuration === sec
                      ? 'bg-[#4cc9f0] text-[#1a1b4b] shadow-md'
                      : 'bg-[#1a1b4b] text-white/80 hover:bg-[#1a1b4b]/80 border border-white/10'
                  }`}
                >
                  {sec}s
                </button>
              ))}
            </div>
          </div>
        ) : (
          <p className="text-xs text-white/70 font-medium">
            {t('lobby.timerHostConfigured', { seconds: sliderDuration })}
          </p>
        )}
      </div>

      {/* Players List Card */}
      <div className="w-full bg-[#2d3282] border-4 border-[#3e46b1] rounded-3xl p-5 sm:p-6 shadow-2xl mb-6">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-[#4cc9f0]" />
            <h2 className="font-black text-base sm:text-lg text-white font-['Outfit'] tracking-wide uppercase">
              {t('lobby.playersInLobby')}
            </h2>
          </div>
          <span className="px-3 py-1 rounded-full bg-[#1a1b4b] text-[#4cc9f0] text-xs font-bold border border-[#4cc9f0]/40 font-mono shadow-inner">
            {t('lobby.playerCount', { count: connectedCount, max: maxPlayers })}
          </span>
        </div>

        {/* Players rows */}
        <div className="space-y-2.5">
          {activePlayers.map((player) => {
            const isMe = player.id === gameState.myPlayerId;
            return (
              <motion.div
                key={player.id}
                layout
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`flex items-center justify-between p-3.5 rounded-2xl border-2 transition-all ${
                  isMe
                    ? 'bg-[#1a1b4b] border-[#4cc9f0] ring-2 ring-[#4cc9f0]/30 shadow-inner'
                    : 'bg-[#1a1b4b]/70 border-white/10'
                }`}
              >
                {/* Player Name & Host Badge */}
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-xl bg-[#2d3282] border border-[#4cc9f0]/40 flex items-center justify-center font-black text-xs text-[#4cc9f0] shrink-0">
                    {player.name.substring(0, 2).toUpperCase()}
                  </div>
                  <div className="flex items-center gap-1.5 truncate">
                    <span className="font-extrabold text-sm sm:text-base text-white truncate">
                      {player.name}
                    </span>
                    {isMe && (
                      <span className="text-[10px] uppercase font-bold text-[#4cc9f0] bg-[#4cc9f0]/20 px-1.5 py-0.5 rounded">
                        {t('lobby.you')}
                      </span>
                    )}
                    {player.isHost && (
                      <span title={t('lobby.host')}>
                        <Crown className="w-4 h-4 text-[#f72585] fill-[#f72585] shrink-0 ml-0.5" />
                      </span>
                    )}
                  </div>
                </div>

                {/* Ready Status Badge */}
                <div className="flex items-center gap-1.5 shrink-0">
                  {player.isReady ? (
                    <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-[#4cc9f0]/20 border border-[#4cc9f0] text-[#4cc9f0] text-xs font-black">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{t('lobby.ready')}</span>
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-white/60 text-xs font-bold">
                      <Circle className="w-3.5 h-3.5" />
                      <span>{t('lobby.notReady')}</span>
                    </span>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Empty slots placeholders */}
        {connectedCount < minPlayers && (
          <div className="mt-3 p-3 rounded-2xl border-2 border-dashed border-white/15 text-center text-xs text-white/60 font-medium">
            {t('lobby.waitingPlayers', { count: missingPlayers })}
          </div>
        )}
      </div>

      {/* Action Controls */}
      <div className="w-full space-y-3">
        {/* Toggle Ready Button */}
        <button
          id="toggle-ready-btn"
          onClick={onToggleReady}
          className={`w-full py-4 px-6 rounded-2xl font-black text-base uppercase tracking-wider transition active:translate-y-[2px] flex items-center justify-center gap-2 cursor-pointer ${
            myPlayer?.isReady
              ? 'bg-[#1a1b4b] hover:bg-[#1a1b4b]/80 text-white border-2 border-[#4cc9f0]/40 shadow-inner'
              : 'bg-[#4cc9f0] hover:brightness-110 text-[#1a1b4b] shadow-[0_6px_0_#3aa9cc] active:shadow-[0_4px_0_#3aa9cc]'
          }`}
        >
          {myPlayer?.isReady ? (
            <>
              <CheckCircle2 className="w-5 h-5 text-[#4cc9f0]" />
              <span>{t('lobby.cancelReady')}</span>
            </>
          ) : (
            <>
              <CheckCircle2 className="w-5 h-5 text-[#1a1b4b]" />
              <span>{t('lobby.toggleReady')}</span>
            </>
          )}
        </button>

        {/* HOST ONLY: START GAME BUTTON */}
        {myPlayer?.isHost && (
          <div className="pt-2">
            <button
              id="start-game-btn"
              disabled={!allReady}
              onClick={onStartGame}
              className={`w-full py-4 px-6 rounded-2xl font-black text-base uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
                allReady
                  ? 'bg-[#f72585] hover:brightness-110 text-white shadow-[0_6px_0_#b5179e] active:translate-y-[2px] active:shadow-[0_4px_0_#b5179e] cursor-pointer'
                  : 'bg-white/10 text-white/30 border-2 border-white/10 cursor-not-allowed'
              }`}
            >
              <Play className="w-5 h-5 fill-current" />
              <span>{t('lobby.startGame')}</span>
            </button>

            {/* Helper status text for host */}
            <div className="text-center mt-2 text-xs font-bold text-white/80">
              {!hasEnoughPlayers ? (
                <span>{t('lobby.needMinPlayers', { min: minPlayers, count: connectedCount })}</span>
              ) : !allReady ? (
                <span className="text-[#4cc9f0]">{t('lobby.waitingAllReady')}</span>
              ) : (
                <span className="text-[#4cc9f0] flex items-center justify-center gap-1 font-black">
                  <Sparkles className="w-3.5 h-3.5" /> {t('lobby.allReadyPrompt')}
                </span>
              )}
            </div>
          </div>
        )}

        {!myPlayer?.isHost && (
          <div className="text-center text-xs font-semibold text-white/70 py-1">
            {t('lobby.waitingHost')}
          </div>
        )}
      </div>
    </div>
  );
};
