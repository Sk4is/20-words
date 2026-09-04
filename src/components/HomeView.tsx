import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Users, ArrowRight, Sparkles, HelpCircle } from 'lucide-react';
import { sound } from '../services/sound';
import { useLanguage } from '../i18n/LanguageContext';

interface HomeViewProps {
  initialName: string;
  onCreateRoom: (name: string) => void;
  onJoinRoom: (code: string, name: string) => void;
  onOpenRules: () => void;
  errorMessage: string | null;
  onClearError: () => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  initialName,
  onCreateRoom,
  onJoinRoom,
  onOpenRules,
  errorMessage,
  onClearError
}) => {
  const { t } = useLanguage();
  const [name, setName] = useState(initialName || '');
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [roomCodeInput, setRoomCodeInput] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);

  const getLocalizedError = (msg: string | null): string | null => {
    if (!msg) return null;
    if (msg.includes('Room not found')) return t('errors.roomNotFound');
    if (msg.includes('Room is full')) return t('errors.roomFull');
    if (msg.includes('round is currently in progress')) return t('errors.roundInProgress');
    if (msg.includes('At least 3 players')) return t('errors.minPlayersRequired');
    if (msg.includes('All players must be ready')) return t('errors.allMustBeReady');
    if (msg.includes('Only the host can start')) return t('errors.onlyHostCanStart');
    if (msg.includes('Only the host can start the next round')) return t('errors.onlyHostCanNextRound');
    if (msg.includes('Round has not finished')) return t('errors.roundNotFinished');
    return msg;
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setValidationError(t('menu.validation.enterNickname'));
      sound.vibrate(50);
      return;
    }
    setValidationError(null);
    onCreateRoom(name.trim());
  };

  const handleOpenJoin = () => {
    if (!name.trim()) {
      setValidationError(t('menu.validation.enterNickname'));
      sound.vibrate(50);
      return;
    }
    setValidationError(null);
    setShowJoinModal(true);
    sound.playPop();
  };

  const handleJoinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomCodeInput.trim()) {
      setValidationError(t('menu.validation.enterCode'));
      sound.vibrate(50);
      return;
    }
    setValidationError(null);
    onJoinRoom(roomCodeInput.trim().toUpperCase(), name.trim());
  };

  const displayError = validationError || getLocalizedError(errorMessage);

  return (
    <div className="w-full max-w-md mx-auto px-4 py-8 flex flex-col items-center justify-center min-h-[calc(100vh-80px)]">
      {/* Game Branding & Logo */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-[#2d3282] border-4 border-[#3e46b1] p-1 mb-4 shadow-xl shadow-[#2d3282]/50">
          <div className="w-full h-full bg-[#1a1b4b] rounded-[18px] flex flex-col items-center justify-center border border-[#4cc9f0]/30">
            <span className="text-3xl font-black text-[#4cc9f0] font-['Outfit'] leading-none">20</span>
            <span className="text-[10px] font-extrabold tracking-widest text-white uppercase">WORDS</span>
          </div>
        </div>

        <h1 className="text-4xl sm:text-5xl font-black tracking-tighter text-[#4cc9f0] italic font-['Outfit']">
          {t('menu.title')}
        </h1>
        <p className="text-white/80 text-sm sm:text-base mt-2 max-w-xs mx-auto font-medium">
          {t('menu.tagline')}
        </p>
      </motion.div>

      {/* Input Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        className="w-full bg-[#2d3282] border-4 border-[#3e46b1] rounded-3xl p-6 sm:p-7 shadow-2xl"
      >
        {/* Error Alert */}
        {displayError && (
          <div className="mb-4 p-3 rounded-2xl bg-[#f72585]/20 border-2 border-[#f72585] text-white text-xs font-bold flex items-center justify-between">
            <span>{displayError}</span>
            <button
              onClick={() => {
                setValidationError(null);
                onClearError();
              }}
              className="text-white/80 hover:text-white ml-2 text-sm font-black"
            >
              ✕
            </button>
          </div>
        )}

        {!showJoinModal ? (
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label htmlFor="display-name-input" className="block text-xs font-bold uppercase tracking-wider text-[#4cc9f0] mb-2">
                {t('menu.playerName')}
              </label>
              <input
                id="display-name-input"
                type="text"
                maxLength={16}
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (validationError) setValidationError(null);
                }}
                placeholder={t('menu.namePlaceholder')}
                className="w-full px-5 py-3.5 rounded-2xl bg-[#1a1b4b] border-2 border-[#4cc9f0]/40 text-white placeholder-white/30 font-bold focus:outline-none focus:border-[#4cc9f0] text-base shadow-inner transition"
                autoComplete="off"
              />
            </div>

            <div className="pt-2 space-y-3">
              {/* CREATE ROOM BUTTON */}
              <button
                id="create-room-btn"
                type="submit"
                className="w-full py-4 px-6 rounded-2xl bg-[#f72585] hover:brightness-110 text-white font-black text-base uppercase tracking-widest shadow-[0_6px_0_#b5179e] active:translate-y-[2px] active:shadow-[0_4px_0_#b5179e] transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Sparkles className="w-5 h-5 fill-white text-white" />
                <span>{t('menu.createRoom')}</span>
              </button>

              {/* JOIN ROOM BUTTON */}
              <button
                id="join-room-open-btn"
                type="button"
                onClick={handleOpenJoin}
                className="w-full py-3.5 px-6 rounded-2xl bg-[#1a1b4b] hover:bg-[#1a1b4b]/80 text-white font-bold text-base tracking-wide border-2 border-[#4cc9f0]/40 hover:border-[#4cc9f0] active:translate-y-[2px] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-inner"
              >
                <Users className="w-5 h-5 text-[#4cc9f0]" />
                <span>{t('menu.joinRoom')}</span>
              </button>
            </div>
          </form>
        ) : (
          /* JOIN ROOM MODAL / VIEW */
          <form onSubmit={handleJoinSubmit} className="space-y-4">
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-lg font-bold text-white font-['Outfit']">{t('menu.joinTitle')}</h2>
              <button
                type="button"
                onClick={() => setShowJoinModal(false)}
                className="text-xs text-[#4cc9f0] hover:text-white font-bold underline cursor-pointer"
              >
                {t('menu.back')}
              </button>
            </div>

            <div>
              <label htmlFor="join-name-input" className="block text-xs font-bold uppercase tracking-wider text-[#4cc9f0] mb-1.5">
                {t('menu.playerName')}
              </label>
              <input
                id="join-name-input"
                type="text"
                maxLength={16}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t('menu.namePlaceholder')}
                className="w-full px-4 py-3 rounded-2xl bg-[#1a1b4b] border-2 border-[#4cc9f0]/40 text-white font-bold focus:outline-none focus:border-[#4cc9f0] text-sm shadow-inner"
              />
            </div>

            <div>
              <label htmlFor="room-code-input" className="block text-xs font-bold uppercase tracking-wider text-[#4cc9f0] mb-1.5">
                {t('menu.roomCode')}
              </label>
              <input
                id="room-code-input"
                type="text"
                maxLength={5}
                value={roomCodeInput}
                onChange={(e) => setRoomCodeInput(e.target.value.toUpperCase())}
                placeholder={t('menu.roomCodePlaceholder')}
                className="w-full px-4 py-3.5 rounded-2xl bg-[#1a1b4b] border-2 border-[#4cc9f0]/50 text-[#4cc9f0] font-mono font-black tracking-widest text-center text-2xl uppercase focus:outline-none focus:border-[#4cc9f0] shadow-inner"
                autoFocus
              />
            </div>

            <div className="pt-2">
              <button
                id="join-room-confirm-btn"
                type="submit"
                className="w-full py-4 px-6 rounded-2xl bg-[#f72585] hover:brightness-110 text-white font-black text-base uppercase tracking-widest shadow-[0_6px_0_#b5179e] active:translate-y-[2px] active:shadow-[0_4px_0_#b5179e] transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>{t('menu.enterRoom')}</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </form>
        )}

        {/* How to play trigger */}
        <div className="mt-6 pt-5 border-t border-white/10 text-center">
          <button
            id="how-to-play-home-btn"
            type="button"
            onClick={onOpenRules}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#4cc9f0] hover:text-white transition cursor-pointer"
          >
            <HelpCircle className="w-4 h-4" />
            <span>{t('menu.howToPlay')}</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
};
