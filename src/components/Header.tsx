import React, { useState } from 'react';
import { Volume2, VolumeX, Copy, Check, DoorOpen, HelpCircle, Shield, EyeOff, Crown } from 'lucide-react';
import { sound } from '../services/sound';
import { ClientGameState } from '../types/game';
import { useLanguage } from '../i18n/LanguageContext';
import { LanguageSelector } from './LanguageSelector';

interface HeaderProps {
  gameState: ClientGameState | null;
  onLeaveRoom: () => void;
  onOpenRules: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  gameState,
  onLeaveRoom,
  onOpenRules
}) => {
  const { t, tCategory } = useLanguage();
  const [isMuted, setIsMuted] = useState(sound.getMuted());
  const [copied, setCopied] = useState(false);

  const handleToggleMute = () => {
    const muted = sound.toggleMute();
    setIsMuted(muted);
  };

  const handleCopyCode = () => {
    if (!gameState?.roomCode) return;
    navigator.clipboard.writeText(gameState.roomCode).catch(() => {});
    setCopied(true);
    sound.playPop();
    setTimeout(() => setCopied(false), 2000);
  };

  const myPlayer = gameState?.players.find(p => p.id === gameState.myPlayerId);
  const localizedCategory = tCategory(gameState?.category);

  return (
    <header className="w-full max-w-5xl mx-auto px-4 py-3 my-2 flex items-center justify-between bg-[#2d3282] rounded-3xl border-b-4 border-[#3e46b1] shadow-xl sticky top-2 z-40">
      {/* Brand & Room Info */}
      <div className="flex items-center gap-2 sm:gap-4">
        {gameState?.roomCode ? (
          <button
            id="room-code-copy-btn"
            onClick={handleCopyCode}
            title={t('header.clickToCopy')}
            className="bg-[#f72585] hover:brightness-110 px-3 sm:px-4 py-1.5 rounded-full text-[11px] sm:text-xs font-black uppercase tracking-widest shadow-lg text-white flex items-center gap-1.5 transition active:scale-95 cursor-pointer border border-pink-400/30"
          >
            <span>{t('header.room', { code: gameState.roomCode })}</span>
            {copied ? (
              <Check className="w-3.5 h-3.5 text-white ml-0.5" />
            ) : (
              <Copy className="w-3.5 h-3.5 text-white/80 ml-0.5" />
            )}
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <span className="text-xl sm:text-2xl font-black italic tracking-tighter text-[#4cc9f0] font-['Outfit'] select-none">
              {t('header.brand')}
            </span>
          </div>
        )}
      </div>

      {/* Category Box (during active game) */}
      {gameState && gameState.category && gameState.phase !== 'LOBBY' && (
        <div className="hidden md:flex flex-col items-center bg-[#1a1b4b] px-6 py-1 rounded-2xl border-2 border-[#4cc9f0] shadow-inner">
          <span className="text-[10px] uppercase font-bold text-[#4cc9f0] tracking-widest leading-none">
            {t('header.category')}
          </span>
          <span className="text-sm font-black uppercase text-white tracking-wide">
            {localizedCategory.name}
          </span>
        </div>
      )}

      {/* Role & Status & Controls */}
      <div className="flex items-center gap-2">
        {gameState && gameState.phase !== 'LOBBY' && gameState.myRole && (
          <div
            id="user-role-badge"
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] sm:text-xs font-extrabold uppercase tracking-wider shadow-md ${
              gameState.myRole === 'IMPOSTOR'
                ? 'bg-[#f72585] text-white border-2 border-white/20'
                : 'bg-[#4cc9f0] text-[#1a1b4b] border-2 border-white/30'
            }`}
          >
            {gameState.myRole === 'IMPOSTOR' ? (
              <>
                <EyeOff className="w-3.5 h-3.5 text-white" />
                <span>{t('header.role.impostor')}</span>
              </>
            ) : (
              <>
                <Shield className="w-3.5 h-3.5 text-[#1a1b4b]" />
                <span>{t('header.role.innocent')}</span>
              </>
            )}
          </div>
        )}

        {myPlayer?.isHost && gameState?.phase === 'LOBBY' && (
          <div className="hidden sm:flex items-center gap-1 px-3 py-1 rounded-full bg-[#4cc9f0]/20 border border-[#4cc9f0]/40 text-[#4cc9f0] text-xs font-bold">
            <Crown className="w-3.5 h-3.5 text-[#4cc9f0]" />
            <span>{t('header.role.host')}</span>
          </div>
        )}

        {/* Language Selector */}
        <LanguageSelector variant="compact" align="right" />

        {/* Controls */}
        <div className="flex items-center gap-1">
          <button
            id="rules-toggle-btn"
            onClick={onOpenRules}
            aria-label={t('header.rules')}
            className="p-2 rounded-xl text-white/70 hover:text-white hover:bg-white/10 transition cursor-pointer"
            title={t('header.rules')}
          >
            <HelpCircle className="w-5 h-5" />
          </button>

          <button
            id="audio-mute-btn"
            onClick={handleToggleMute}
            aria-label={isMuted ? t('header.unmuteSound') : t('header.muteSound')}
            className="p-2 rounded-xl text-white/70 hover:text-white hover:bg-white/10 transition cursor-pointer"
            title={isMuted ? t('header.unmuteSound') : t('header.muteSound')}
          >
            {isMuted ? <VolumeX className="w-5 h-5 text-[#f72585]" /> : <Volume2 className="w-5 h-5" />}
          </button>

          {gameState && (
            <button
              id="leave-room-btn"
              type="button"
              onClick={onLeaveRoom}
              aria-label={t('header.leaveRoom')}
              className="flex items-center gap-1.5 px-2.5 sm:px-3.5 py-1.5 rounded-2xl bg-rose-600/25 hover:bg-rose-600/40 active:bg-rose-600/60 border-2 border-rose-400/40 text-rose-200 hover:text-white transition active:scale-95 cursor-pointer shadow-md ml-1 shrink-0"
              title={t('header.leaveRoom')}
            >
              <DoorOpen className="w-4 h-4 text-rose-300 shrink-0" />
              <span className="font-black text-[11px] sm:text-xs tracking-wider uppercase font-['Outfit'] whitespace-nowrap">
                {t('header.leaveRoom')}
              </span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
