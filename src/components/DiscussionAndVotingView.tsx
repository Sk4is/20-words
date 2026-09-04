import React, { useState } from 'react';
import { motion } from 'motion/react';
import { CheckCircle2, Vote, AlertCircle, UserX, Smartphone } from 'lucide-react';
import { ClientGameState } from '../types/game';
import { LargeClueView } from './LargeClueView';
import { useLanguage } from '../i18n/LanguageContext';

interface DiscussionAndVotingViewProps {
  gameState: ClientGameState;
  onSubmitVote: (targetPlayerId: string) => void;
}

export const DiscussionAndVotingView: React.FC<DiscussionAndVotingViewProps> = ({
  gameState,
  onSubmitVote
}) => {
  const { t } = useLanguage();

  // On entering from the clue phase, automatically show the large fullscreen clue
  const [showLargeClue, setShowLargeClue] = useState<boolean>(true);
  const [selectedTargetId, setSelectedTargetId] = useState<string | null>(null);

  const activePlayers = gameState.players.filter(p => p.isConnected);
  const myPlayer = activePlayers.find(p => p.id === gameState.myPlayerId);
  const myClue = myPlayer?.clue || gameState.mySubmittedClue || '';
  const hasVoted = Boolean(myPlayer?.hasVoted || gameState.myVoteTargetId);

  const isTiebreak = gameState.phase === 'TIEBREAK_VOTING';
  const tiedIds = gameState.tiedPlayerIds || [];

  const handleVoteClick = (targetId: string) => {
    if (hasVoted) return;
    if (targetId === gameState.myPlayerId) return;
    if (isTiebreak && !tiedIds.includes(targetId)) return;
    setSelectedTargetId(targetId);
  };

  const handleConfirmVote = () => {
    if (!selectedTargetId || hasVoted) return;
    onSubmitVote(selectedTargetId);
  };

  const votedCount = activePlayers.filter(p => p.hasVoted).length;
  const totalCount = activePlayers.length;

  const getTargetDisplayName = (id: string | null): string => {
    if (!id) return '';
    if (id === 'NOBODY') return t('voting.nobody') || 'NADIE';
    const p = activePlayers.find(player => player.id === id);
    return p ? p.name.toUpperCase() : '';
  };

  // Determine if NOBODY option is eligible:
  // In normal voting: always eligible
  // In tiebreak: eligible ONLY if 'NOBODY' is among tiedIds
  const isNobodyEligible = !isTiebreak || tiedIds.includes('NOBODY');

  return (
    <div className="w-full max-w-xl mx-auto px-4 py-4 sm:py-6 flex flex-col items-center">
      {/* Fullscreen Large Clue Display Modal */}
      <LargeClueView
        clue={myClue}
        isOpen={showLargeClue}
        onMinimize={() => setShowLargeClue(false)}
      />

      {/* Button to Reopen Large Clue Fullscreen at any time */}
      <div className="w-full mb-5">
        <button
          id="reopen-large-clue-btn"
          type="button"
          onClick={() => setShowLargeClue(true)}
          className="w-full p-4 rounded-2xl bg-[#4361ee] hover:bg-[#3a56d4] active:bg-[#2f46b0] text-white font-black text-sm sm:text-base uppercase tracking-wider flex items-center justify-between shadow-xl shadow-[#4361ee]/25 border-2 border-white/20 transition-all cursor-pointer"
        >
          <div className="flex items-center gap-2.5">
            <Smartphone className="w-5 h-5 text-[#4cc9f0]" />
            <span className="font-['Outfit']">{t('largeClue.showMyClue') || 'MOSTRAR MI PISTA'}</span>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-black/20 text-[#4cc9f0] border border-white/10 uppercase tracking-widest truncate max-w-[140px] sm:max-w-xs">
            {myClue ? `"${myClue}"` : t('game.noClue')}
          </span>
        </button>
      </div>

      {/* Title & Discussion Header - No timer! */}
      <div className="text-center mb-6 w-full">
        {isTiebreak ? (
          <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[#f72585]/20 border-2 border-[#f72585] text-white text-xs font-black uppercase tracking-widest mb-2 animate-pulse">
            <AlertCircle className="w-4 h-4 text-[#f72585]" />
            <span>{t('voting.tiebreakTitle') || 'VOTACIÓN DE DESEMPATE'}</span>
          </div>
        ) : null}

        <h1 className="text-2xl sm:text-4xl font-black text-white font-['Outfit'] tracking-tight uppercase">
          {isTiebreak
            ? (t('voting.tiebreakTitle') || 'VOTACIÓN DE DESEMPATE')
            : (t('voting.title') || '¿QUIÉN ES EL IMPOSTOR?')}
        </h1>
        <p className="text-white/75 text-xs sm:text-sm mt-1.5 max-w-md mx-auto font-medium leading-relaxed">
          {isTiebreak
            ? (t('voting.tiebreakSubtitle') || 'Empate en la votación. Solo las opciones empatadas son seleccionables.')
            : (t('voting.subtitle') || 'Debatid libremente sin tiempo. Vota a un jugador sospechoso o vota a Nadie.')}
        </p>
      </div>

      {/* Candidate List - Large Selectable Cards */}
      <div className="w-full space-y-3 mb-6">
        {activePlayers.map((player) => {
          const isMe = player.id === gameState.myPlayerId;
          const isCandidateEligible = !isMe && (!isTiebreak || tiedIds.includes(player.id));
          const isSelected = selectedTargetId === player.id;

          // If in tiebreak and this player is not among the tied suspects, don't show or show disabled
          if (isTiebreak && !tiedIds.includes(player.id)) {
            return null;
          }

          return (
            <motion.div
              key={player.id}
              layout
              id={`candidate-card-${player.id}`}
              onClick={() => {
                if (isCandidateEligible && !hasVoted) {
                  handleVoteClick(player.id);
                }
              }}
              className={`w-full p-4 sm:p-5 rounded-2xl sm:rounded-3xl border-3 sm:border-4 transition-all select-none ${
                isCandidateEligible && !hasVoted
                  ? 'cursor-pointer hover:border-[#4cc9f0] active:scale-[0.99]'
                  : 'cursor-default'
              } ${
                isSelected
                  ? 'bg-[#2d3282] border-[#f72585] ring-4 ring-[#f72585]/40 shadow-xl shadow-[#f72585]/20'
                  : isMe
                  ? 'bg-[#1a1b4b]/60 border-white/10 opacity-60'
                  : 'bg-[#2d3282] border-[#3e46b1] hover:bg-[#2d3282]/90 shadow-md'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black text-sm border-2 ${
                      isSelected
                        ? 'bg-[#f72585] border-white text-white shadow-md'
                        : isMe
                        ? 'bg-white/5 border-white/10 text-white/50'
                        : 'bg-[#1a1b4b] border-white/20 text-[#4cc9f0]'
                    }`}
                  >
                    {player.name.charAt(0).toUpperCase()}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-black text-base sm:text-xl text-white font-['Outfit'] tracking-wide">
                        {player.name.toUpperCase()}
                      </span>
                      {isMe && (
                        <span className="text-[10px] uppercase font-black text-[#4cc9f0] bg-[#4cc9f0]/20 px-2 py-0.5 rounded-full border border-[#4cc9f0]/30">
                          {t('voting.you') || 'Tú'}
                        </span>
                      )}
                      {isTiebreak && tiedIds.includes(player.id) && (
                        <span className="text-[10px] uppercase font-black text-white bg-[#f72585] px-2 py-0.5 rounded-full shadow">
                          {t('voting.tiedSuspect') || 'EMPATADO'}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Selection Indicator */}
                {isCandidateEligible && !hasVoted && (
                  <div
                    className={`w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all ${
                      isSelected
                        ? 'border-[#f72585] bg-[#f72585] text-white shadow-md'
                        : 'border-white/40 hover:border-[#4cc9f0]'
                    }`}
                  >
                    {isSelected && <div className="w-3 h-3 rounded-full bg-white" />}
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}

        {/* NOBODY (Spanish: NADIE) Option Card */}
        {isNobodyEligible && (
          <motion.div
            layout
            id="candidate-card-nobody"
            onClick={() => {
              if (!hasVoted) {
                handleVoteClick('NOBODY');
              }
            }}
            className={`w-full p-4 sm:p-5 rounded-2xl sm:rounded-3xl border-3 sm:border-4 transition-all select-none ${
              !hasVoted
                ? 'cursor-pointer hover:border-[#4cc9f0] active:scale-[0.99]'
                : 'cursor-default'
            } ${
              selectedTargetId === 'NOBODY'
                ? 'bg-[#2d3282] border-[#f72585] ring-4 ring-[#f72585]/40 shadow-xl shadow-[#f72585]/20'
                : 'bg-[#1a1b4b]/80 border-dashed border-white/25 hover:border-white/40 shadow-md'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black text-sm border-2 ${
                    selectedTargetId === 'NOBODY'
                      ? 'bg-[#f72585] border-white text-white shadow-md'
                      : 'bg-[#2d3282] border-white/20 text-white/70'
                  }`}
                >
                  <UserX className="w-5 h-5" />
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-black text-base sm:text-xl text-white font-['Outfit'] tracking-wide">
                      {t('voting.nobody') || 'NADIE'}
                    </span>
                    {isTiebreak && tiedIds.includes('NOBODY') && (
                      <span className="text-[10px] uppercase font-black text-white bg-[#f72585] px-2 py-0.5 rounded-full shadow">
                        {t('voting.tiedSuspect') || 'EMPATADO'}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] sm:text-xs text-white/50 font-medium">
                    {t('voting.nobodySubtitle') || 'Crees que nadie debe ser eliminado en esta votación'}
                  </p>
                </div>
              </div>

              {!hasVoted && (
                <div
                  className={`w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all ${
                    selectedTargetId === 'NOBODY'
                      ? 'border-[#f72585] bg-[#f72585] text-white shadow-md'
                      : 'border-white/40 hover:border-[#4cc9f0]'
                  }`}
                >
                  {selectedTargetId === 'NOBODY' && <div className="w-3 h-3 rounded-full bg-white" />}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </div>

      {/* Vote Submission & Locked Confirmation State */}
      <div className="w-full max-w-md mt-2">
        {!hasVoted ? (
          <button
            id="confirm-vote-btn"
            type="button"
            disabled={!selectedTargetId}
            onClick={handleConfirmVote}
            className="w-full py-4 px-6 rounded-2xl bg-[#f72585] hover:brightness-110 active:translate-y-[2px] disabled:opacity-40 disabled:cursor-not-allowed text-white font-black text-base sm:text-lg uppercase tracking-wider transition-all shadow-[0_6px_0_#b5179e] active:shadow-[0_2px_0_#b5179e] flex items-center justify-center gap-2 cursor-pointer border-2 border-white/20"
          >
            <Vote className="w-5 h-5" />
            <span>
              {selectedTargetId
                ? (selectedTargetId === 'NOBODY'
                    ? (t('voting.castVoteNobody') || 'VOTAR A NADIE')
                    : (t('voting.castVoteFor', { name: getTargetDisplayName(selectedTargetId) }) || `VOTAR A ${getTargetDisplayName(selectedTargetId)}`))
                : (t('voting.selectPlayerFirst') || 'SELECCIONA UN SOSPECHOSO')}
            </span>
          </button>
        ) : (
          <div
            id="vote-submitted-confirmation"
            className="p-5 rounded-3xl bg-[#2d3282] border-4 border-[#4cc9f0] text-center space-y-2 shadow-2xl"
          >
            <div className="inline-flex items-center gap-2 text-[#4cc9f0] font-black text-lg sm:text-xl font-['Outfit'] uppercase tracking-wider">
              <CheckCircle2 className="w-6 h-6 text-[#4cc9f0]" />
              <span>{t('voting.voteSubmitted') || 'VOTO ENVIADO ✓'}</span>
            </div>
            <p className="text-xs sm:text-sm text-white/80 font-medium">
              {t('voting.waitingVotes', { count: votedCount, total: totalCount }) ||
                `Esperando a que voten todos los jugadores... (${votedCount}/${totalCount} han votado)`}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
