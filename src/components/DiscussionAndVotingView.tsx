import React, { useState } from 'react';
import { motion } from 'motion/react';
import { MessageSquareQuote, CheckCircle2, Circle, Vote, Grid, ChevronDown, ChevronUp, AlertCircle, UserX } from 'lucide-react';
import { ClientGameState } from '../types/game';
import { WordGrid } from './WordGrid';
import { useLanguage } from '../i18n/LanguageContext';

interface DiscussionAndVotingViewProps {
  gameState: ClientGameState;
  onSubmitVote: (targetPlayerId: string) => void;
}

export const DiscussionAndVotingView: React.FC<DiscussionAndVotingViewProps> = ({
  gameState,
  onSubmitVote
}) => {
  const { t, tCategory } = useLanguage();
  const [selectedTargetId, setSelectedTargetId] = useState<string | null>(null);
  const [showWordGrid, setShowWordGrid] = useState(false);

  const activePlayers = gameState.players.filter(p => p.isConnected);
  const myPlayer = activePlayers.find(p => p.id === gameState.myPlayerId);
  const hasVoted = Boolean(myPlayer?.hasVoted);

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
  const localizedCategory = tCategory(gameState.category);

  const getTargetDisplayName = (id: string | null): string => {
    if (!id) return '';
    if (id === 'NOBODY') return t('voting.nobody').toUpperCase();
    const p = activePlayers.find(player => player.id === id);
    return p ? p.name.toUpperCase() : '';
  };

  return (
    <div className="w-full max-w-2xl mx-auto px-4 py-4 sm:py-6 flex flex-col items-center">
      {/* Title & Discussion Header */}
      <div className="text-center mb-5">
        {isTiebreak ? (
          <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[#f72585]/20 border-2 border-[#f72585] text-white text-xs font-black uppercase tracking-wider mb-2 animate-pulse">
            <AlertCircle className="w-3.5 h-3.5 text-[#f72585]" />
            <span>{t('voting.tiebreakerBadge')}</span>
          </div>
        ) : (
          <div className="text-xs font-black uppercase tracking-widest text-[#4cc9f0] mb-1">
            {t('voting.categoryHeader', { category: localizedCategory.name })}
          </div>
        )}

        <h2 className="text-3xl sm:text-4xl font-black text-white font-['Outfit'] tracking-tight">
          {isTiebreak ? t('voting.titleTiebreak') : t('voting.title')}
        </h2>
        <p className="text-white/80 text-xs sm:text-sm mt-1 max-w-md mx-auto font-medium">
          {isTiebreak ? t('voting.subtitleTiebreak') : t('voting.subtitle')}
        </p>
      </div>

      {/* Toggle to view 20 Words Grid for context */}
      <div className="w-full mb-4">
        <button
          type="button"
          onClick={() => setShowWordGrid(!showWordGrid)}
          className="w-full py-3 px-4 rounded-2xl bg-[#2d3282] hover:bg-[#2d3282]/80 border-2 border-[#3e46b1] text-white text-xs font-bold flex items-center justify-between transition cursor-pointer shadow-md"
        >
          <span className="flex items-center gap-2">
            <Grid className="w-4 h-4 text-[#4cc9f0]" />
            <span>{showWordGrid ? t('voting.hideGrid') : t('voting.reviewGrid')}</span>
          </span>
          {showWordGrid ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {showWordGrid && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="pt-3"
          >
            <WordGrid
              words={gameState.words}
              secretWord={gameState.secretWord}
              isImpostor={gameState.myRole === 'IMPOSTOR'}
            />
          </motion.div>
        )}
      </div>

      {/* Clues & Voting Candidates List */}
      <div className="w-full space-y-2.5 mb-6">
        {activePlayers.map((player) => {
          const isMe = player.id === gameState.myPlayerId;
          const isCandidateEligible = !isMe && (!isTiebreak || tiedIds.includes(player.id));
          const isSelected = selectedTargetId === player.id;

          return (
            <motion.div
              key={player.id}
              layout
              onClick={() => {
                if (isCandidateEligible && !hasVoted) {
                  handleVoteClick(player.id);
                }
              }}
              className={`p-3.5 sm:p-4 rounded-2xl sm:rounded-3xl border-2 sm:border-4 transition-all ${
                isCandidateEligible && !hasVoted
                  ? 'cursor-pointer hover:border-[#4cc9f0] active:scale-[0.99]'
                  : 'cursor-default'
              } ${
                isSelected
                  ? 'bg-[#2d3282] border-[#f72585] ring-4 ring-[#f72585]/30 shadow-xl'
                  : isMe
                  ? 'bg-[#1a1b4b]/80 border-white/10 opacity-80'
                  : !isCandidateEligible
                  ? 'bg-[#1a1b4b]/50 border-white/5 opacity-50'
                  : 'bg-[#2d3282] border-[#3e46b1] hover:bg-[#2d3282]/90'
              }`}
            >
              <div className="flex items-center justify-between">
                {/* Player details & Clue */}
                <div className="min-w-0 pr-3">
                  <div className="flex items-center gap-2">
                    <span className="font-black text-sm sm:text-base text-white truncate">
                      {player.name}
                    </span>
                    {isMe && (
                      <span className="text-[10px] uppercase font-bold text-[#4cc9f0] bg-[#4cc9f0]/20 px-1.5 py-0.5 rounded">
                        {t('voting.you')}
                      </span>
                    )}
                    {isTiebreak && tiedIds.includes(player.id) && (
                      <span className="text-[10px] uppercase font-black text-white bg-[#f72585] px-2 py-0.5 rounded shadow">
                        {t('voting.tiedSuspect')}
                      </span>
                    )}
                  </div>

                  {/* The Clue they gave */}
                  <div className="flex items-center gap-1.5 mt-1">
                    <MessageSquareQuote className="w-3.5 h-3.5 text-[#4cc9f0] shrink-0" />
                    <span className="text-xs sm:text-sm font-black font-mono text-[#4cc9f0] truncate">
                      "{player.clue || t('clueReveal.noClue')}"
                    </span>
                  </div>
                </div>

                {/* Status or Vote Selection Radio */}
                <div className="flex items-center gap-2 shrink-0">
                  {/* Private voting status indicator */}
                  {player.hasVoted ? (
                    <span className="flex items-center gap-1 text-[11px] font-bold text-[#4cc9f0] bg-[#4cc9f0]/20 px-2 py-0.5 rounded-full border border-[#4cc9f0]/40">
                      <CheckCircle2 className="w-3 h-3 text-[#4cc9f0]" />
                      <span>{t('voting.voted')}</span>
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-[11px] font-medium text-white/50 bg-white/10 px-2 py-0.5 rounded-full">
                      <Circle className="w-3 h-3" />
                      <span>{t('voting.waiting')}</span>
                    </span>
                  )}

                  {/* Voting Button for eligible candidate */}
                  {isCandidateEligible && !hasVoted && (
                    <div
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                        isSelected
                          ? 'border-[#f72585] bg-[#f72585] text-white shadow-md'
                          : 'border-white/40 hover:border-[#4cc9f0]'
                      }`}
                    >
                      {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-white" />}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}

        {/* Option to Vote "Nobody" (unless tiebreaker) */}
        {!isTiebreak && (
          <motion.div
            layout
            onClick={() => {
              if (!hasVoted) {
                handleVoteClick('NOBODY');
              }
            }}
            className={`p-3.5 sm:p-4 rounded-2xl sm:rounded-3xl border-2 sm:border-4 transition-all ${
              !hasVoted ? 'cursor-pointer hover:border-[#4cc9f0] active:scale-[0.99]' : 'cursor-default'
            } ${
              selectedTargetId === 'NOBODY'
                ? 'bg-[#2d3282] border-[#f72585] ring-4 ring-[#f72585]/30 shadow-xl'
                : 'bg-[#1a1b4b]/60 border-dashed border-white/20 hover:border-white/40'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-[#2d3282] border border-white/20 flex items-center justify-center text-white/70">
                  <UserX className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-black text-sm sm:text-base text-white/90">
                    {t('voting.nobody')}
                  </span>
                  <p className="text-[11px] text-white/50 font-medium">
                    {t('voting.nobodyDesc')}
                  </p>
                </div>
              </div>

              {!hasVoted && (
                <div
                  className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                    selectedTargetId === 'NOBODY'
                      ? 'border-[#f72585] bg-[#f72585] text-white shadow-md'
                      : 'border-white/40 hover:border-[#4cc9f0]'
                  }`}
                >
                  {selectedTargetId === 'NOBODY' && <div className="w-2.5 h-2.5 rounded-full bg-white" />}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </div>

      {/* Vote Submission Card */}
      <div className="w-full max-w-md">
        {!hasVoted ? (
          <button
            id="confirm-vote-btn"
            disabled={!selectedTargetId}
            onClick={handleConfirmVote}
            className="w-full py-4 px-6 rounded-2xl bg-[#f72585] hover:brightness-110 disabled:opacity-40 disabled:cursor-not-allowed text-white font-black text-sm sm:text-base uppercase tracking-widest transition-all active:translate-y-[2px] active:shadow-[0_4px_0_#b5179e] shadow-[0_6px_0_#b5179e] flex items-center justify-center gap-2 cursor-pointer"
          >
            <Vote className="w-5 h-5" />
            <span>
              {selectedTargetId
                ? t('voting.voteFor', { name: getTargetDisplayName(selectedTargetId) })
                : t('voting.selectPrompt')}
            </span>
          </button>
        ) : (
          <div className="p-4 rounded-3xl bg-[#2d3282] border-4 border-[#3e46b1] text-center space-y-1 shadow-xl">
            <div className="inline-flex items-center gap-1.5 text-[#4cc9f0] font-black text-sm uppercase tracking-wider">
              <CheckCircle2 className="w-4 h-4 text-[#4cc9f0]" />
              <span>{t('voting.voteLocked')}</span>
            </div>
            <p className="text-xs text-white/70 font-medium">
              {t('voting.waitingAllVotes', { count: votedCount, total: totalCount })}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
