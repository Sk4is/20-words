import React, { useState, useEffect } from 'react';
import { useGameSocket } from './hooks/useGameSocket';
import { Header } from './components/Header';
import { HomeView } from './components/HomeView';
import { LobbyView } from './components/LobbyView';
import { CluePhaseView } from './components/CluePhaseView';
import { ClueRevealView } from './components/ClueRevealView';
import { DiscussionAndVotingView } from './components/DiscussionAndVotingView';
import { ImpostorGuessView } from './components/ImpostorGuessView';
import { RoundResultView } from './components/RoundResultView';
import { RulesModal } from './components/RulesModal';
import { WifiOff, RefreshCw } from 'lucide-react';
import { useLanguage } from './i18n/LanguageContext';

export default function App() {
  const { t } = useLanguage();
  const {
    status,
    gameState,
    savedName,
    errorMessage,
    createRoom,
    joinRoom,
    toggleReady,
    startGame,
    submitClue,
    submitVote,
    submitImpostorGuess,
    nextRound,
    leaveRoom,
    clearError
  } = useGameSocket();

  const [showRules, setShowRules] = useState(false);

  // Check URL query param for shared room link (e.g. ?room=A7K4Q)
  useEffect(() => {
    if (typeof window !== 'undefined' && !gameState) {
      const params = new URLSearchParams(window.location.search);
      const roomParam = params.get('room');
      if (roomParam && savedName && status === 'CONNECTED') {
        joinRoom(roomParam.toUpperCase(), savedName);
      }
    }
  }, [status, gameState, savedName, joinRoom]);

  // Sync room query param when room changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (gameState?.roomCode) {
        const url = new URL(window.location.href);
        url.searchParams.set('room', gameState.roomCode);
        window.history.replaceState({}, '', url.toString());
      } else {
        const url = new URL(window.location.href);
        if (url.searchParams.has('room')) {
          url.searchParams.delete('room');
          window.history.replaceState({}, '', url.toString());
        }
      }
    }
  }, [gameState?.roomCode]);

  return (
    <div className="min-h-screen bg-[#1a1b4b] text-white flex flex-col font-['Plus_Jakarta_Sans'] antialiased selection:bg-[#f72585] selection:text-white">
      {/* Reconnection Alert Banner */}
      {status === 'DISCONNECTED' && (
        <div className="w-full bg-rose-600/90 text-white text-xs font-bold py-2 px-4 flex items-center justify-center gap-2 shadow-md sticky top-0 z-50">
          <WifiOff className="w-4 h-4 animate-pulse" />
          <span>{t('connection.reconnecting')}</span>
          <RefreshCw className="w-3.5 h-3.5 animate-spin ml-2" />
        </div>
      )}

      {/* Header */}
      <Header
        gameState={gameState}
        onLeaveRoom={leaveRoom}
        onOpenRules={() => setShowRules(true)}
      />

      {/* Main Game Phase Router */}
      <main className="flex-1 flex flex-col items-center justify-center p-2 sm:p-4">
        {!gameState ? (
          <HomeView
            initialName={savedName}
            onCreateRoom={createRoom}
            onJoinRoom={joinRoom}
            onOpenRules={() => setShowRules(true)}
            errorMessage={errorMessage}
            onClearError={clearError}
          />
        ) : gameState.phase === 'LOBBY' ? (
          <LobbyView
            gameState={gameState}
            onToggleReady={toggleReady}
            onStartGame={startGame}
          />
        ) : gameState.phase === 'CLUE_PHASE' ? (
          <CluePhaseView
            gameState={gameState}
            onSubmitClue={submitClue}
          />
        ) : gameState.phase === 'CLUE_REVEAL' ? (
          <ClueRevealView
            gameState={gameState}
          />
        ) : gameState.phase === 'DISCUSSION' ||
          gameState.phase === 'VOTING' ||
          gameState.phase === 'TIEBREAK_VOTING' ? (
          <DiscussionAndVotingView
            gameState={gameState}
            onSubmitVote={submitVote}
          />
        ) : gameState.phase === 'IMPOSTOR_GUESS' ? (
          <ImpostorGuessView
            gameState={gameState}
            onSubmitGuess={submitImpostorGuess}
          />
        ) : gameState.phase === 'ROUND_RESULT' ? (
          <RoundResultView
            gameState={gameState}
            onNextRound={nextRound}
          />
        ) : null}
      </main>

      {/* Rules Modal */}
      <RulesModal
        isOpen={showRules}
        onClose={() => setShowRules(false)}
      />
    </div>
  );
}
