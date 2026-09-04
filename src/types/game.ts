export type GamePhase =
  | 'LOBBY'
  | 'ROUND_START'
  | 'CLUE_PHASE'
  | 'CLUE_REVEAL'
  | 'DISCUSSION'
  | 'VOTING'
  | 'TIEBREAK_VOTING'
  | 'IMPOSTOR_GUESS'
  | 'ROUND_RESULT';

export type PlayerRole = 'INNOCENT' | 'IMPOSTOR';

export type PlayerStatus = 'active' | 'eliminated';

export interface PlayerPublic {
  id: string;
  name: string;
  isHost: boolean;
  isReady: boolean;
  isConnected: boolean;
  status: PlayerStatus;
  score: number;
  clueSubmitted: boolean;
  hasVoted: boolean;
  // During CLUE_REVEAL, DISCUSSION, VOTING, ROUND_RESULT:
  clue?: string;
  // In ROUND_RESULT or after votes tallied:
  role?: PlayerRole;
  voteCount?: number;
}

export type WinReason =
  | 'IMPOSTOR_NOT_CAUGHT'
  | 'IMPOSTOR_GUESSED_WORD'
  | 'IMPOSTOR_CAUGHT_FAILED_GUESS';

export interface ClientGameState {
  roomCode: string;
  phase: GamePhase;
  roundNumber: number;
  players: PlayerPublic[];
  myPlayerId: string;
  isHost: boolean;
  category: string;
  words: string[]; // 20 words
  // Private / authoritative info:
  myRole: PlayerRole | null;
  // NEVER sent to the Impostor until ROUND_RESULT:
  secretWord?: string;
  secretWordIndex?: number;
  
  // Clue Phase:
  clueDuration?: number; // Configurable timer in seconds (10 - 120s, default 30s)
  roundEndTimestamp?: number | null;
  mySubmittedClue?: string;

  // Discussion & Voting:
  tiedPlayerIds?: string[]; // for TIEBREAK_VOTING
  myVoteTargetId?: string;

  // Impostor Guess / Results:
  impostorId?: string;
  impostorName?: string;
  impostorGuess?: string | null;
  winner?: 'INNOCENTS' | 'IMPOSTOR' | null;
  winReason?: WinReason | null;
  eliminatedOption?: string | null;
  eliminatedName?: string | null;
  eliminatedPlayerId?: string | null;
  pointsAwarded?: {
    [playerId: string]: number;
  };
}

// Client to Server Actions
export type ClientAction =
  | { type: 'CREATE_ROOM'; playerName: string }
  | { type: 'JOIN_ROOM'; roomCode: string; playerName: string; playerId?: string }
  | { type: 'RECONNECT'; roomCode: string; playerId: string }
  | { type: 'TOGGLE_READY' }
  | { type: 'START_GAME' }
  | { type: 'SET_CLUE_DURATION'; duration: number }
  | { type: 'SUBMIT_CLUE'; clue: string }
  | { type: 'START_VOTING' }
  | { type: 'SUBMIT_VOTE'; targetPlayerId: string }
  | { type: 'SUBMIT_IMPOSTOR_GUESS'; word: string }
  | { type: 'NEXT_ROUND' }
  | { type: 'LEAVE_ROOM' };

// Server to Client Messages
export type ServerMessage =
  | { type: 'SYNC_STATE'; state: ClientGameState }
  | { type: 'ERROR'; message: string }
  | { type: 'ROOM_CREATED'; roomCode: string; playerId: string }
  | { type: 'ROOM_JOINED'; roomCode: string; playerId: string }
  | { type: 'TICK_WARN'; remainingSeconds: number };
