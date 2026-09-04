import { WebSocket } from 'ws';
import crypto from 'crypto';
import {
  ClientGameState,
  GamePhase,
  PlayerPublic,
  PlayerRole,
  WinReason
} from '../src/types/game.js';
import { CATEGORIES, selectRoundWords } from '../src/data/categories.js';

export interface InternalPlayer {
  id: string;
  name: string;
  isHost: boolean;
  isReady: boolean;
  isConnected: boolean;
  score: number;
  role: PlayerRole | null;
  clue: string | null;
  clueSubmitted: boolean;
  voteTargetId: string | null;
  hasVoted: boolean;
  status: 'active' | 'eliminated';
  ws?: WebSocket | null;
  lastActive: number;
}

export interface InternalRoom {
  code: string;
  hostId: string;
  phase: GamePhase;
  roundNumber: number;
  category: string;
  words: string[];
  secretWord: string;
  secretWordIndex: number;
  impostorId: string | null;
  impostorGuess: string | null;
  roundEndTimestamp: number | null;
  revealEndTimestamp: number | null;
  phaseTimer: NodeJS.Timeout | null;
  tiedPlayerIds: string[];
  eliminatedOption: string | null;
  eliminatedPlayerId?: string | null;
  clueDuration?: number;
  winner: 'INNOCENTS' | 'IMPOSTOR' | null;
  winReason: WinReason | null;
  pointsAwarded: Record<string, number>;
  players: Map<string, InternalPlayer>;
  createdAt: number;
}

export class GameManager {
  private rooms: Map<string, InternalRoom> = new Map();

  // Generate distinct, clean 5-character room code
  private generateRoomCode(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Avoid 0/O, 1/I
    let code = '';
    do {
      code = '';
      for (let i = 0; i < 5; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
      }
    } while (this.rooms.has(code));
    return code;
  }

  public createRoom(hostName: string, ws: WebSocket, hostPlayerId?: string): { room: InternalRoom; player: InternalPlayer } {
    const code = this.generateRoomCode();
    const playerId = hostPlayerId || 'p_' + Math.random().toString(36).substring(2, 10);

    const hostPlayer: InternalPlayer = {
      id: playerId,
      name: hostName.trim() || 'Player 1',
      isHost: true,
      isReady: false,
      isConnected: true,
      score: 0,
      role: null,
      clue: null,
      clueSubmitted: false,
      voteTargetId: null,
      hasVoted: false,
      status: 'active',
      ws,
      lastActive: Date.now()
    };

    const room: InternalRoom = {
      code,
      hostId: playerId,
      phase: 'LOBBY',
      roundNumber: 0,
      category: '',
      words: [],
      secretWord: '',
      secretWordIndex: -1,
      impostorId: null,
      impostorGuess: null,
      roundEndTimestamp: null,
      revealEndTimestamp: null,
      phaseTimer: null,
      tiedPlayerIds: [],
      eliminatedOption: null,
      eliminatedPlayerId: null,
      clueDuration: 30,
      winner: null,
      winReason: null,
      pointsAwarded: {},
      players: new Map([[playerId, hostPlayer]]),
      createdAt: Date.now()
    };

    this.rooms.set(code, room);
    return { room, player: hostPlayer };
  }

  public joinRoom(roomCode: string, playerName: string, ws: WebSocket, playerId?: string): { room: InternalRoom; player: InternalPlayer } | { error: string } {
    const code = roomCode.toUpperCase().trim();
    const room = this.rooms.get(code);

    if (!room) {
      return { error: 'Room not found. Check the code and try again.' };
    }

    // Check if player is reconnecting with existing playerId
    if (playerId && room.players.has(playerId)) {
      const existing = room.players.get(playerId)!;
      existing.ws = ws;
      existing.isConnected = true;
      existing.lastActive = Date.now();
      if (playerName.trim()) {
        existing.name = playerName.trim();
      }
      return { room, player: existing };
    }

    // Check capacity
    const activePlayers = Array.from(room.players.values()).filter(p => p.isConnected);
    if (activePlayers.length >= 6) {
      return { error: 'Room is full (maximum 6 players).' };
    }

    if (room.phase !== 'LOBBY') {
      return { error: 'A round is currently in progress. Please wait for the lobby.' };
    }

    const newPlayerId = playerId || 'p_' + Math.random().toString(36).substring(2, 10);
    const newPlayer: InternalPlayer = {
      id: newPlayerId,
      name: playerName.trim() || `Player ${room.players.size + 1}`,
      isHost: false,
      isReady: false,
      isConnected: true,
      score: 0,
      role: null,
      clue: null,
      clueSubmitted: false,
      voteTargetId: null,
      hasVoted: false,
      status: 'active',
      ws,
      lastActive: Date.now()
    };

    room.players.set(newPlayerId, newPlayer);
    return { room, player: newPlayer };
  }

  public handleDisconnect(ws: WebSocket): void {
    for (const room of this.rooms.values()) {
      for (const player of room.players.values()) {
        if (player.ws === ws) {
          player.isConnected = false;
          player.ws = null;
          player.lastActive = Date.now();

          // If the disconnected player was the host, transfer host to next connected player
          if (player.isHost) {
            const nextHost = Array.from(room.players.values()).find(p => p.isConnected && p.id !== player.id);
            if (nextHost) {
              player.isHost = false;
              nextHost.isHost = true;
              room.hostId = nextHost.id;
            }
          }

          // If disconnected while in LOBBY, remove player immediately so no ghost or duplicate players remain
          if (room.phase === 'LOBBY') {
            room.players.delete(player.id);
          }

          const remaining = Array.from(room.players.values()).filter(p => p.isConnected);
          if (remaining.length === 0) {
            if (room.phaseTimer) {
              clearTimeout(room.phaseTimer);
              room.phaseTimer = null;
            }
            this.rooms.delete(room.code);
            return;
          }

          this.broadcastRoomState(room);
          return;
        }
      }
    }
  }

  private checkEmptyRoomCleanup(room: InternalRoom): void {
    const connectedCount = Array.from(room.players.values()).filter(p => p.isConnected).length;
    if (connectedCount === 0) {
      if (room.phaseTimer) {
        clearTimeout(room.phaseTimer);
        room.phaseTimer = null;
      }
      this.rooms.delete(room.code);
    }
  }

  public toggleReady(playerId: string, roomCode: string): void {
    const room = this.rooms.get(roomCode.toUpperCase());
    if (!room || room.phase !== 'LOBBY') return;
    const player = room.players.get(playerId);
    if (!player) return;

    player.isReady = !player.isReady;
    this.broadcastRoomState(room);
  }

  public startGame(playerId: string, roomCode: string): { success: boolean; error?: string } {
    const room = this.rooms.get(roomCode.toUpperCase());
    if (!room) return { success: false, error: 'Room not found' };

    const player = room.players.get(playerId);
    if (!player || !player.isHost) return { success: false, error: 'Only the host can start the game' };

    const activePlayers = Array.from(room.players.values()).filter(p => p.isConnected);
    if (activePlayers.length < 3) {
      return { success: false, error: 'At least 3 players are required to start.' };
    }

    const allReady = activePlayers.every(p => p.isReady);
    if (!allReady) {
      return { success: false, error: 'All players must be ready before starting.' };
    }

    this.startNewRound(room);
    return { success: true };
  }

  public nextRound(playerId: string, roomCode: string): { success: boolean; error?: string } {
    const room = this.rooms.get(roomCode.toUpperCase());
    if (!room) return { success: false, error: 'Room not found' };

    const player = room.players.get(playerId);
    if (!player || !player.isHost) return { success: false, error: 'Only the host can start the next round' };

    if (room.phase !== 'ROUND_RESULT') {
      return { success: false, error: 'Round has not finished yet' };
    }

    this.startNewRound(room);
    return { success: true };
  }

  private startNewRound(room: InternalRoom): void {
    if (room.phaseTimer) {
      clearTimeout(room.phaseTimer);
      room.phaseTimer = null;
    }

    const activePlayers = Array.from(room.players.values()).filter(p => p.isConnected);
    if (activePlayers.length < 3) {
      room.phase = 'LOBBY';
      this.broadcastRoomState(room);
      return;
    }

    // Pick random category
    const catIndex = Math.floor(Math.random() * CATEGORIES.length);
    const categoryData = CATEGORIES[catIndex];
    const { words, secretWord, secretIndex } = selectRoundWords(categoryData);

    // Pick random Impostor using Fisher-Yates and crypto.randomInt for uniform probability
    const pool = [...activePlayers];
    for (let i = pool.length - 1; i > 0; i--) {
      const j = crypto.randomInt(0, i + 1);
      const temp = pool[i];
      pool[i] = pool[j];
      pool[j] = temp;
    }
    const impostorIndex = crypto.randomInt(0, pool.length);
    const impostorPlayer = pool[impostorIndex];

    room.roundNumber += 1;
    room.category = categoryData.name;
    room.words = words;
    room.secretWord = secretWord;
    room.secretWordIndex = secretIndex;
    room.impostorId = impostorPlayer.id;
    room.impostorGuess = null;
    room.winner = null;
    room.winReason = null;
    room.pointsAwarded = {};
    room.tiedPlayerIds = [];
    room.eliminatedOption = null;

    // Assign player roles and reset round state (resetting any previously eliminated player to active)
    for (const player of room.players.values()) {
      player.status = 'active';
      if (player.isConnected) {
        player.role = player.id === impostorPlayer.id ? 'IMPOSTOR' : 'INNOCENT';
      } else {
        player.role = null;
      }
      player.clue = null;
      player.clueSubmitted = false;
      player.voteTargetId = null;
      player.hasVoted = false;
    }

    // Start CLUE_PHASE with 30-second timer
    room.phase = 'CLUE_PHASE';
    const durationMs = 30000;
    room.roundEndTimestamp = Date.now() + durationMs;

    this.broadcastRoomState(room);

    // Server authoritative timer for clue phase
    room.phaseTimer = setTimeout(() => {
      this.endCluePhase(room);
    }, durationMs);
  }

  public submitClue(playerId: string, roomCode: string, clueText: string): void {
    const room = this.rooms.get(roomCode.toUpperCase());
    if (!room || room.phase !== 'CLUE_PHASE') return;

    const player = room.players.get(playerId);
    if (!player || player.clueSubmitted) return;

    // Sanitize and limit clue: max 3 words, max 20 chars
    let sanitized = clueText.trim().replace(/[\r\n\t]+/g, ' ');
    if (sanitized.length > 20) {
      sanitized = sanitized.substring(0, 20);
    }
    const words = sanitized.split(' ').filter(Boolean).slice(0, 3);
    sanitized = words.join(' ');

    player.clue = sanitized || 'No clue';
    player.clueSubmitted = true;

    // Check if all connected active players have submitted
    const activePlayers = Array.from(room.players.values()).filter(p => p.isConnected);
    const allSubmitted = activePlayers.every(p => p.clueSubmitted);

    if (allSubmitted) {
      if (room.phaseTimer) clearTimeout(room.phaseTimer);
      this.endCluePhase(room);
    } else {
      this.broadcastRoomState(room);
    }
  }

  private endCluePhase(room: InternalRoom): void {
    if (room.phaseTimer) {
      clearTimeout(room.phaseTimer);
      room.phaseTimer = null;
    }

    // Autofill any missing clues
    for (const player of room.players.values()) {
      if (player.isConnected && !player.clueSubmitted) {
        player.clue = player.clue || 'NO CLUE';
        player.clueSubmitted = true;
      }
      player.voteTargetId = null;
      player.hasVoted = false;
    }

    // Transition straight to VOTING with NO TIMER (players can discuss freely)
    room.phase = 'VOTING';
    room.roundEndTimestamp = null;
    room.revealEndTimestamp = null;
    room.tiedPlayerIds = [];

    this.broadcastRoomState(room);
  }

  public skipClueReveal(playerId: string, roomCode: string): void {
    const room = this.rooms.get(roomCode.toUpperCase());
    if (!room) return;
    if (room.phaseTimer) clearTimeout(room.phaseTimer);
    this.transitionToDiscussion(room);
  }

  private transitionToDiscussion(room: InternalRoom): void {
    if (room.phaseTimer) {
      clearTimeout(room.phaseTimer);
      room.phaseTimer = null;
    }
    room.phase = 'VOTING';
    this.broadcastRoomState(room);
  }

  public startVotingPhase(playerId: string, roomCode: string): void {
    const room = this.rooms.get(roomCode.toUpperCase());
    if (!room) return;
    room.phase = 'VOTING';
    for (const player of room.players.values()) {
      player.voteTargetId = null;
      player.hasVoted = false;
    }
    this.broadcastRoomState(room);
  }

  public submitVote(playerId: string, roomCode: string, targetPlayerId: string): void {
    const room = this.rooms.get(roomCode.toUpperCase());
    if (!room || (room.phase !== 'VOTING' && room.phase !== 'TIEBREAK_VOTING' && room.phase !== 'DISCUSSION')) return;

    if (room.phase === 'DISCUSSION') {
      room.phase = 'VOTING';
    }

    const voter = room.players.get(playerId);
    if (!voter || voter.hasVoted) return;

    // Cannot vote for self
    if (playerId === targetPlayerId) return;

    // In tiebreak, can only vote for one of the tied options
    if (room.phase === 'TIEBREAK_VOTING') {
      if (!room.tiedPlayerIds.includes(targetPlayerId)) {
        return;
      }
    } else {
      if (targetPlayerId !== 'NOBODY') {
        const target = room.players.get(targetPlayerId);
        if (!target || !target.isConnected) return;
      }
    }

    voter.voteTargetId = targetPlayerId;
    voter.hasVoted = true;

    // Check if all connected players have voted
    const activePlayers = Array.from(room.players.values()).filter(p => p.isConnected);
    const allVoted = activePlayers.every(p => p.hasVoted);

    if (allVoted) {
      this.evaluateVotes(room);
    } else {
      this.broadcastRoomState(room);
    }
  }

  private evaluateVotes(room: InternalRoom): void {
    const activePlayers = Array.from(room.players.values()).filter(p => p.isConnected);
    const isTiebreak = room.phase === 'TIEBREAK_VOTING' && room.tiedPlayerIds.length > 0;
    const candidateIds = isTiebreak
      ? [...room.tiedPlayerIds]
      : [...activePlayers.map(p => p.id), 'NOBODY'];

    const voteCounts: Record<string, number> = {};
    candidateIds.forEach(id => {
      voteCounts[id] = 0;
    });

    activePlayers.forEach(p => {
      if (p.voteTargetId && voteCounts[p.voteTargetId] !== undefined) {
        voteCounts[p.voteTargetId]++;
      }
    });

    // Find highest vote count
    let maxVotes = -1;
    for (const count of Object.values(voteCounts)) {
      if (count > maxVotes) {
        maxVotes = count;
      }
    }

    // Options that received the highest vote count
    const topVotedOptions = candidateIds.filter(id => voteCounts[id] === maxVotes);

    if (topVotedOptions.length > 1) {
      // Tiebreak! Only the tied options should be selectable.
      room.phase = 'TIEBREAK_VOTING';
      room.tiedPlayerIds = topVotedOptions;
      // Reset votes for tiebreak
      for (const p of room.players.values()) {
        p.voteTargetId = null;
        p.hasVoted = false;
      }
      this.broadcastRoomState(room);
      return;
    }

    // Single highest voted option
    const eliminatedOption = topVotedOptions[0];
    room.eliminatedOption = eliminatedOption;

    if (eliminatedOption === 'NOBODY') {
      // NOBODY receives the most votes: No player is eliminated.
      // Since nobody was eliminated, Impostor was not caught and wins the round!
      room.winner = 'IMPOSTOR';
      room.winReason = 'IMPOSTOR_NOT_CAUGHT';
      room.phase = 'ROUND_RESULT';
      room.pointsAwarded = {};
      if (room.impostorId && room.players.has(room.impostorId)) {
        const imp = room.players.get(room.impostorId)!;
        imp.score += 2;
        room.pointsAwarded[imp.id] = 2;
      }
      this.broadcastRoomState(room);
      return;
    }

    // A specific player receives the most votes and is eliminated!
    const isImpostor = eliminatedOption === room.impostorId;

    if (!isImpostor) {
      // An innocent was eliminated! Impostor wins.
      room.winner = 'IMPOSTOR';
      room.winReason = 'IMPOSTOR_NOT_CAUGHT';
      room.phase = 'ROUND_RESULT';
      room.pointsAwarded = {};
      if (room.impostorId && room.players.has(room.impostorId)) {
        const imp = room.players.get(room.impostorId)!;
        imp.score += 2;
        room.pointsAwarded[imp.id] = 2;
      }
      this.broadcastRoomState(room);
    } else {
      // The Impostor was identified and eliminated!
      // Impostor gets one final chance to guess the secret word.
      room.phase = 'IMPOSTOR_GUESS';
      this.broadcastRoomState(room);
    }
  }

  public submitImpostorGuess(playerId: string, roomCode: string, guessedWord: string): void {
    const room = this.rooms.get(roomCode.toUpperCase());
    if (!room || room.phase !== 'IMPOSTOR_GUESS') return;

    if (playerId !== room.impostorId) return;

    room.impostorGuess = guessedWord;
    const isCorrect = guessedWord.toLowerCase().trim() === room.secretWord.toLowerCase().trim();

    room.pointsAwarded = {};
    if (isCorrect) {
      // Impostor steals the win! +2 points for winning + 1 bonus point for correct guess = +3
      room.winner = 'IMPOSTOR';
      room.winReason = 'IMPOSTOR_GUESSED_WORD';
      const imp = room.players.get(room.impostorId)!;
      imp.score += 3;
      room.pointsAwarded[imp.id] = 3;
    } else {
      // Impostor failed guess, Innocents win! +1 point each
      room.winner = 'INNOCENTS';
      room.winReason = 'IMPOSTOR_CAUGHT_FAILED_GUESS';
      for (const player of room.players.values()) {
        if (player.role === 'INNOCENT') {
          player.score += 1;
          room.pointsAwarded[player.id] = 1;
        }
      }
    }

    room.phase = 'ROUND_RESULT';
    this.broadcastRoomState(room);
  }

  public leaveRoom(playerId: string, roomCode: string): void {
    const room = this.rooms.get(roomCode.toUpperCase());
    if (!room) return;

    const player = room.players.get(playerId);
    if (!player) return;

    // If the leaving player was the host, transfer host/admin privileges automatically to another connected player
    if (player.isHost) {
      const nextHost = Array.from(room.players.values()).find(p => p.isConnected && p.id !== playerId);
      if (nextHost) {
        nextHost.isHost = true;
        room.hostId = nextHost.id;
      }
    }

    // Remove that player from the current room in real time
    room.players.delete(playerId);

    // If the last player leaves, the empty room can be deleted/cleaned up immediately
    const remaining = Array.from(room.players.values()).filter(p => p.isConnected);
    if (remaining.length === 0 || room.players.size === 0) {
      if (room.phaseTimer) {
        clearTimeout(room.phaseTimer);
        room.phaseTimer = null;
      }
      this.rooms.delete(room.code);
      return;
    }

    // If Impostor leaves during an active match, award win to Innocents and conclude round
    if (room.impostorId === playerId && room.phase !== 'LOBBY' && room.phase !== 'ROUND_RESULT') {
      if (room.phaseTimer) {
        clearTimeout(room.phaseTimer);
        room.phaseTimer = null;
      }
      room.winner = 'INNOCENTS';
      room.winReason = 'IMPOSTOR_CAUGHT_FAILED_GUESS';
      for (const p of room.players.values()) {
        if (p.role === 'INNOCENT') {
          p.score += 1;
          room.pointsAwarded[p.id] = 1;
        }
      }
      room.phase = 'ROUND_RESULT';
      this.broadcastRoomState(room);
      return;
    }

    // If leaving during clue phase or voting phase, check if remaining players have all submitted
    if (room.phase === 'CLUE_PHASE') {
      const allSubmitted = remaining.every(p => p.clueSubmitted);
      if (allSubmitted && remaining.length > 0) {
        if (room.phaseTimer) {
          clearTimeout(room.phaseTimer);
          room.phaseTimer = null;
        }
        this.endCluePhase(room);
        return;
      }
    } else if (room.phase === 'VOTING' || room.phase === 'TIEBREAK_VOTING') {
      const allVoted = remaining.every(p => p.hasVoted);
      if (allVoted && remaining.length > 0) {
        this.evaluateVotes(room);
        return;
      }
    }

    // Update the player list for everyone else immediately
    this.broadcastRoomState(room);
  }

  /**
   * CRITICAL SECURITY METHOD
   * Generates a tailored client state for a specific player.
   * NEVER sends secretWord or secretWordIndex to the Impostor until ROUND_RESULT!
   */
  public getClientStateForPlayer(room: InternalRoom, playerId: string): ClientGameState {
    const me = room.players.get(playerId);
    const isImpostor = me?.role === 'IMPOSTOR';
    const isRoundOver = room.phase === 'ROUND_RESULT';

    // Compute vote counts for each player if votes are finished or in result
    const voteCounts: Record<string, number> = {};
    if (isRoundOver) {
      for (const p of room.players.values()) {
        if (p.voteTargetId) {
          voteCounts[p.voteTargetId] = (voteCounts[p.voteTargetId] || 0) + 1;
        }
      }
    }

    // Build public player list
    const playersPublic: PlayerPublic[] = Array.from(room.players.values()).map(p => {
      const showClue = room.phase !== 'LOBBY' && room.phase !== 'ROUND_START' && room.phase !== 'CLUE_PHASE';
      return {
        id: p.id,
        name: p.name,
        isHost: p.isHost,
        isReady: p.isReady,
        isConnected: p.isConnected,
        score: p.score,
        clueSubmitted: p.clueSubmitted,
        hasVoted: p.hasVoted,
        status: p.status || 'active',
        // Only reveal other clues in reveal/discussion/results
        clue: (showClue || p.id === playerId) ? (p.clue ?? undefined) : undefined,
        // Roles only revealed at round result!
        role: isRoundOver ? (p.role ?? undefined) : undefined,
        voteCount: isRoundOver ? (voteCounts[p.id] || 0) : undefined
      };
    });

    const impostorPlayer = room.impostorId ? room.players.get(room.impostorId) : null;

    const state: ClientGameState = {
      roomCode: room.code,
      phase: room.phase,
      roundNumber: room.roundNumber,
      players: playersPublic,
      myPlayerId: playerId,
      isHost: me?.isHost || false,
      category: room.category,
      words: room.words,
      myRole: me?.role || null,
      roundEndTimestamp: room.roundEndTimestamp,
      clueDuration: room.clueDuration || 30,
      eliminatedPlayerId: room.eliminatedPlayerId || null,
      mySubmittedClue: me?.clue ?? undefined,
      tiedPlayerIds: room.tiedPlayerIds,
      myVoteTargetId: me?.voteTargetId ?? undefined
    };

    // SECURITY: Secret word is only sent to Innocents, OR everyone once ROUND_RESULT is reached
    if (isRoundOver || (!isImpostor && me?.role === 'INNOCENT')) {
      state.secretWord = room.secretWord;
      state.secretWordIndex = room.secretWordIndex;
    }
    // Note: If me is Impostor and not round result, state.secretWord and state.secretWordIndex are strictly undefined!

    // In Round Result or Impostor Guess
    if (isRoundOver || room.phase === 'IMPOSTOR_GUESS') {
      state.impostorId = room.impostorId ?? undefined;
      state.impostorName = impostorPlayer?.name;
    }

    if (isRoundOver) {
      state.impostorGuess = room.impostorGuess;
      state.winner = room.winner;
      state.winReason = room.winReason;
      state.pointsAwarded = room.pointsAwarded;
      state.eliminatedOption = room.eliminatedOption;
      if (room.eliminatedOption === 'NOBODY') {
        state.eliminatedName = 'NOBODY';
      } else if (room.eliminatedOption) {
        state.eliminatedName = room.players.get(room.eliminatedOption)?.name || 'Unknown';
      }
    }

    return state;
  }

  public broadcastRoomState(room: InternalRoom): void {
    for (const player of room.players.values()) {
      if (player.ws && player.ws.readyState === WebSocket.OPEN) {
        const clientState = this.getClientStateForPlayer(room, player.id);
        player.ws.send(JSON.stringify({
          type: 'SYNC_STATE',
          state: clientState
        }));
      }
    }
  }

  public getRoom(roomCode: string): InternalRoom | undefined {
    return this.rooms.get(roomCode.toUpperCase());
  }
}

export const gameManager = new GameManager();
