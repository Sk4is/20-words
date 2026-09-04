import { WebSocket } from 'ws';
import fs from 'fs';
import path from 'path';
import { initializeApp, FirebaseApp } from 'firebase/app';
import {
  getFirestore,
  Firestore,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  deleteDoc,
  runTransaction,
  onSnapshot,
  Unsubscribe
} from 'firebase/firestore';
import {
  ClientGameState,
  GamePhase,
  PlayerPublic,
  PlayerRole,
  PlayerStatus,
  WinReason
} from '../src/types/game.js';
import { CATEGORIES, selectRoundWords, getRandomCategory } from '../src/data/categories.js';

export interface FirestorePlayer {
  playerId: string;
  name: string;
  joinedAt: number;
  ready: boolean;
  connected: boolean;
  isHost: boolean;
  status: PlayerStatus;
  score: number;
  role: PlayerRole | null;
  clue: string | null;
  clueSubmitted: boolean;
  voteTargetId: string | null;
  hasVoted: boolean;
  lastActive: number;
}

export interface FirestoreRoom {
  roomCode: string;
  createdAt: number;
  hostPlayerId: string;
  currentPhase: GamePhase;
  maxPlayers: number;
  players: Record<string, FirestorePlayer>;
  clueDuration: number;
  roundNumber: number;
  category: string;
  words: string[];
  secretWord: string;
  secretWordIndex: number;
  impostorId: string | null;
  impostorGuess: string | null;
  roundEndTimestamp: number | null;
  revealEndTimestamp: number | null;
  tiedPlayerIds: string[];
  eliminatedOption: string | null;
  winner: 'INNOCENTS' | 'IMPOSTOR' | null;
  winReason: WinReason | null;
  pointsAwarded: Record<string, number>;
  recentSecretWords?: string[];
  updatedAt: number;
}

export class CustomError extends Error {
  code: string;
  constructor(message: string, code: string) {
    super(message);
    this.code = code;
    Object.setPrototypeOf(this, CustomError.prototype);
  }
}

export class FirestoreGameManager {
  private db!: Firestore;
  private firebaseApp!: FirebaseApp;

  // Local connection tracking for this Cloud Run instance
  // socket -> { roomCode, playerId }
  private socketPlayerMap: Map<WebSocket, { roomCode: string; playerId: string }> = new Map();
  // roomCode -> Set of WebSockets connected to this instance
  private roomSockets: Map<string, Set<WebSocket>> = new Map();
  // roomCode -> Firestore onSnapshot unsubscribe function
  private roomListeners: Map<string, Unsubscribe> = new Map();
  // roomCode -> cached latest FirestoreRoom data on this instance
  private roomCache: Map<string, FirestoreRoom> = new Map();
  // roomCode -> local phase timeout
  private roomTimers: Map<string, NodeJS.Timeout> = new Map();

  constructor() {
    this.initFirebase();
  }

  private initFirebase() {
    try {
      const configPath = path.resolve(process.cwd(), 'firebase-applet-config.json');
      if (!fs.existsSync(configPath)) {
        throw new Error('firebase-applet-config.json not found');
      }
      const rawConfig = fs.readFileSync(configPath, 'utf8');
      const config = JSON.parse(rawConfig);
      this.firebaseApp = initializeApp(config);
      this.db = getFirestore(this.firebaseApp, config.firestoreDatabaseId);
      console.log(`[FIREBASE INITIALIZED] Connected to project: ${config.projectId}, database: ${config.firestoreDatabaseId}`);
    } catch (err) {
      console.error('[DATABASE ERROR] Failed to initialize Firebase Firestore:', err);
    }
  }

  // Generate distinct, clean 5-character room code (avoid 0/O, 1/I)
  private generateCodeCandidate(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 5; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }

  /**
   * Room Creation:
   * 1. Generate unique room code.
   * 2. Check room code does not already exist in Firestore.
   * 3. Create room in the shared database.
   * 4. Add creator as first player and set as host.
   * 5. Return room code only after room is successfully persisted.
   */
  public async createRoom(
    hostName: string,
    ws: WebSocket,
    hostPlayerId?: string
  ): Promise<{ room: FirestoreRoom; player: FirestorePlayer }> {
    let attempts = 0;
    let roomCode = '';

    while (attempts < 10) {
      const candidate = this.generateCodeCandidate();
      const ref = doc(this.db, 'rooms', candidate);
      const snap = await getDoc(ref);
      if (!snap.exists()) {
        roomCode = candidate;
        break;
      }
      attempts++;
    }

    if (!roomCode) {
      roomCode = this.generateCodeCandidate();
    }

    const playerId = hostPlayerId || 'p_' + Math.random().toString(36).substring(2, 10);
    const cleanName = hostName.trim() || 'Player 1';

    const hostPlayer: FirestorePlayer = {
      playerId,
      name: cleanName,
      joinedAt: Date.now(),
      ready: false,
      connected: true,
      isHost: true,
      status: 'active',
      score: 0,
      role: null,
      clue: null,
      clueSubmitted: false,
      voteTargetId: null,
      hasVoted: false,
      lastActive: Date.now()
    };

    const newRoom: FirestoreRoom = {
      roomCode,
      createdAt: Date.now(),
      hostPlayerId: playerId,
      currentPhase: 'LOBBY',
      maxPlayers: 6,
      players: {
        [playerId]: hostPlayer
      },
      clueDuration: 30,
      roundNumber: 0,
      category: '',
      words: [],
      secretWord: '',
      secretWordIndex: -1,
      impostorId: null,
      impostorGuess: null,
      roundEndTimestamp: null,
      revealEndTimestamp: null,
      tiedPlayerIds: [],
      eliminatedOption: null,
      winner: null,
      winReason: null,
      pointsAwarded: {},
      updatedAt: Date.now()
    };

    const roomRef = doc(this.db, 'rooms', roomCode);
    await setDoc(roomRef, newRoom);
    console.log(`[ROOM CREATION] Room created: ${roomCode}`);
    console.log(`[ROOM CREATION] Host: ${cleanName} (${playerId})`);

    // Register local WebSocket connection
    this.registerLocalSocket(ws, roomCode, playerId);
    // Subscribe to Firestore changes for this room on this instance
    this.ensureRoomListener(roomCode);

    return { room: newRoom, player: hostPlayer };
  }

  /**
   * Join Room:
   * 1. Normalize code (trim, uppercase).
   * 2. Read room from shared database.
   * 3. If exists, allow user to join.
   * 4. If does not exist, return ROOM_NOT_FOUND.
   * 5. If room has 6 players, return ROOM_FULL.
   * 6. Prevent duplicate player entries, support reconnection.
   * 7. Concurrency-safe atomic transaction.
   */
  public async joinRoom(
    roomCode: string,
    playerName: string,
    ws: WebSocket,
    playerId?: string
  ): Promise<{ room: FirestoreRoom; player: FirestorePlayer }> {
    const code = (roomCode || '').trim().toUpperCase();
    console.log(`[JOIN ATTEMPT] Join attempt: ${code}`);

    if (!code || code.length < 3) {
      console.log(`[JOIN FAILED] Invalid code: "${code}"`);
      throw new CustomError('Invalid room code. Check the code and try again.', 'INVALID_CODE');
    }

    const roomRef = doc(this.db, 'rooms', code);

    try {
      const result = await runTransaction(this.db, async (tx) => {
        const snap = await tx.get(roomRef);
        if (!snap.exists()) {
          console.log(`[JOIN ATTEMPT] Room found: false`);
          console.log(`[JOIN FAILED] Reason: ROOM_NOT_FOUND for code: ${code}`);
          throw new CustomError('Room not found. Check the code and try again.', 'ROOM_NOT_FOUND');
        }

        console.log(`[JOIN ATTEMPT] Room found: true`);
        const room = snap.data() as FirestoreRoom;
        const currentPlayers = room.players || {};
        const activePlayers = Object.values(currentPlayers).filter(p => p.connected);

        console.log(`[JOIN ATTEMPT] Current players: ${activePlayers.length}`);

        // Check if player is reconnecting with an existing playerId
        if (playerId && currentPlayers[playerId]) {
          const existingPlayer = { ...currentPlayers[playerId] };
          existingPlayer.connected = true;
          existingPlayer.lastActive = Date.now();
          if (playerName.trim()) {
            existingPlayer.name = playerName.trim();
          }

          const updatedPlayers = { ...currentPlayers, [playerId]: existingPlayer };
          tx.update(roomRef, {
            players: updatedPlayers,
            updatedAt: Date.now()
          });

          console.log(`[JOIN ATTEMPT] Player joined successfully (reconnected existing player ${existingPlayer.name})`);
          return {
            room: { ...room, players: updatedPlayers },
            player: existingPlayer
          };
        }

        // Capacity check: max 6 active players
        if (activePlayers.length >= 6) {
          console.log(`[JOIN FAILED] Reason: ROOM_FULL. Room ${code} already has ${activePlayers.length}/6 players.`);
          throw new CustomError('Room is full (maximum 6 players).', 'ROOM_FULL');
        }

        // Phase check: must be LOBBY to join as a new player
        if (room.currentPhase !== 'LOBBY') {
          console.log(`[JOIN FAILED] Reason: Game in progress. Room ${code} is in phase ${room.currentPhase}.`);
          throw new CustomError('A round is currently in progress. Please wait for the lobby.', 'ROUND_IN_PROGRESS');
        }

        const newPlayerId = playerId || 'p_' + Math.random().toString(36).substring(2, 10);
        const cleanName = playerName.trim() || `Player ${Object.keys(currentPlayers).length + 1}`;

        const newPlayer: FirestorePlayer = {
          playerId: newPlayerId,
          name: cleanName,
          joinedAt: Date.now(),
          ready: false,
          connected: true,
          isHost: false,
          status: 'active',
          score: 0,
          role: null,
          clue: null,
          clueSubmitted: false,
          voteTargetId: null,
          hasVoted: false,
          lastActive: Date.now()
        };

        const updatedPlayers = {
          ...currentPlayers,
          [newPlayerId]: newPlayer
        };

        tx.update(roomRef, {
          players: updatedPlayers,
          updatedAt: Date.now()
        });

        console.log(`[JOIN ATTEMPT] Player joined successfully`);
        return {
          room: { ...room, players: updatedPlayers },
          player: newPlayer
        };
      });

      // Register local socket mapping and start listening
      this.registerLocalSocket(ws, code, result.player.playerId);
      this.ensureRoomListener(code);

      return result;
    } catch (err: any) {
      if (err instanceof CustomError) {
        throw err;
      }
      console.error(`[DATABASE ERROR] Join room failed on Firestore transaction:`, err);
      throw new CustomError(err.message || 'Database error occurred. Please try again.', 'DATABASE_ERROR');
    }
  }

  /**
   * Reconnection:
   * Called when a client socket reconnects and presents stored roomCode & playerId
   */
  public async reconnect(
    roomCode: string,
    ws: WebSocket,
    playerId: string
  ): Promise<{ room: FirestoreRoom; player: FirestorePlayer }> {
    return this.joinRoom(roomCode, '', ws, playerId);
  }

  /**
   * Register local socket connection for this Cloud Run instance
   */
  private registerLocalSocket(ws: WebSocket, roomCode: string, playerId: string) {
    this.socketPlayerMap.set(ws, { roomCode, playerId });

    if (!this.roomSockets.has(roomCode)) {
      this.roomSockets.set(roomCode, new Set());
    }
    this.roomSockets.get(roomCode)!.add(ws);
  }

  /**
   * Subscribe to real-time changes for a room from Firestore
   */
  private ensureRoomListener(roomCode: string) {
    if (this.roomListeners.has(roomCode)) {
      return;
    }

    const roomRef = doc(this.db, 'rooms', roomCode);
    const unsubscribe = onSnapshot(
      roomRef,
      (snapshot) => {
        if (!snapshot.exists()) {
          console.log(`[REALTIME SYNC] Room ${roomCode} was removed or does not exist`);
          this.roomCache.delete(roomCode);
          this.broadcastRoomNotFound(roomCode);
          return;
        }

        const room = snapshot.data() as FirestoreRoom;
        this.roomCache.set(roomCode, room);
        console.log(`[REALTIME SYNC] Snapshot received for room ${roomCode}, phase: ${room.currentPhase}, players: ${Object.keys(room.players || {}).length}`);

        // Check if there is an active clue phase with a timer
        this.handlePhaseTimer(room);

        // Broadcast updated state to all local clients in this room
        this.broadcastRoomStateToLocalSockets(room);
      },
      (error) => {
        console.error(`[DATABASE ERROR] Firestore onSnapshot error on room ${roomCode}:`, error);
      }
    );

    this.roomListeners.set(roomCode, unsubscribe);
  }

  /**
   * Manage authoritative clue phase timer
   */
  private handlePhaseTimer(room: FirestoreRoom) {
    // If phase is CLUE_PHASE and we have a roundEndTimestamp
    if (room.currentPhase === 'CLUE_PHASE' && room.roundEndTimestamp) {
      if (this.roomTimers.has(room.roomCode)) {
        return; // Timer already running
      }

      const remainingMs = Math.max(100, room.roundEndTimestamp - Date.now());
      const timer = setTimeout(async () => {
        this.roomTimers.delete(room.roomCode);
        await this.endCluePhase(room.roomCode);
      }, remainingMs);

      this.roomTimers.set(room.roomCode, timer);
    } else {
      // Clear timer if phase is not CLUE_PHASE
      if (this.roomTimers.has(room.roomCode)) {
        clearTimeout(this.roomTimers.get(room.roomCode)!);
        this.roomTimers.delete(room.roomCode);
      }
    }
  }

  /**
   * Handle socket disconnect
   */
  public async handleSocketDisconnect(ws: WebSocket): Promise<void> {
    const entry = this.socketPlayerMap.get(ws);
    if (!entry) return;

    const { roomCode, playerId } = entry;
    this.socketPlayerMap.delete(ws);

    const sockets = this.roomSockets.get(roomCode);
    if (sockets) {
      sockets.delete(ws);
      if (sockets.size === 0) {
        this.roomSockets.delete(roomCode);
        // Unsubscribe from Firestore snapshot if no local players remain on this instance
        const unsub = this.roomListeners.get(roomCode);
        if (unsub) {
          unsub();
          this.roomListeners.delete(roomCode);
        }
      }
    }

    console.log(`[DISCONNECT] Socket closed for player ${playerId} in room ${roomCode}`);

    // Update connection status in Firestore
    try {
      const roomRef = doc(this.db, 'rooms', roomCode);
      await runTransaction(this.db, async (tx) => {
        const snap = await tx.get(roomRef);
        if (!snap.exists()) return;

        const room = snap.data() as FirestoreRoom;
        if (!room.players || !room.players[playerId]) return;

        const player = { ...room.players[playerId] };
        player.connected = false;
        player.lastActive = Date.now();

        // If disconnected player was host, transfer host to next connected player
        let updatedHostId = room.hostPlayerId;
        const updatedPlayers = { ...room.players, [playerId]: player };

        if (player.isHost) {
          const nextHost = Object.values(updatedPlayers).find(p => p.connected && p.playerId !== playerId);
          if (nextHost) {
            player.isHost = false;
            nextHost.isHost = true;
            updatedHostId = nextHost.playerId;
            updatedPlayers[nextHost.playerId] = nextHost;
          }
        }

        // Note: Do NOT immediately delete player during temporary disconnects so they can reconnect!
        tx.update(roomRef, {
          players: updatedPlayers,
          hostPlayerId: updatedHostId,
          updatedAt: Date.now()
        });
      });
    } catch (err) {
      console.error(`[DATABASE ERROR] Failed to update player disconnect in Firestore:`, err);
    }
  }

  /**
   * Leave Room:
   * Explicitly remove player when clicking "SALIR DE LA SALA"
   */
  public async leaveRoom(roomCode: string, playerId: string, ws?: WebSocket): Promise<void> {
    const code = roomCode.trim().toUpperCase();

    // Dissociate socket immediately so no subsequent state broadcast is sent to it
    if (ws) {
      this.socketPlayerMap.delete(ws);
      const sockets = this.roomSockets.get(code);
      if (sockets) {
        sockets.delete(ws);
        if (sockets.size === 0) {
          this.roomSockets.delete(code);
          const unsub = this.roomListeners.get(code);
          if (unsub) {
            unsub();
            this.roomListeners.delete(code);
          }
        }
      }
    } else {
      for (const [sock, entry] of this.socketPlayerMap.entries()) {
        if (entry.roomCode === code && entry.playerId === playerId) {
          this.socketPlayerMap.delete(sock);
          const sockets = this.roomSockets.get(code);
          if (sockets) {
            sockets.delete(sock);
            if (sockets.size === 0) {
              this.roomSockets.delete(code);
              const unsub = this.roomListeners.get(code);
              if (unsub) {
                unsub();
                this.roomListeners.delete(code);
              }
            }
          }
          break;
        }
      }
    }

    const roomRef = doc(this.db, 'rooms', code);

    try {
      await runTransaction(this.db, async (tx) => {
        const snap = await tx.get(roomRef);
        if (!snap.exists()) return;

        const room = snap.data() as FirestoreRoom;
        const players = { ...room.players };
        if (!players[playerId]) return;

        const leavingPlayer = players[playerId];
        delete players[playerId];

        const remainingPlayers = Object.values(players);
        const remainingConnected = remainingPlayers.filter(p => p.connected);

        // If no players remain, clean up room
        if (remainingPlayers.length === 0) {
          tx.delete(roomRef);
          console.log(`[ROOM CLEANUP] Room ${code} was deleted because all players left.`);
          return;
        }

        let updatedHostId = room.hostPlayerId;
        // Transfer host if leaving player was host
        if (leavingPlayer.isHost && remainingConnected.length > 0) {
          const nextHost = remainingConnected[0];
          nextHost.isHost = true;
          updatedHostId = nextHost.playerId;
          players[nextHost.playerId] = nextHost;
        }

        tx.update(roomRef, {
          players,
          hostPlayerId: updatedHostId,
          updatedAt: Date.now()
        });

        console.log(`[LEAVE ROOM] Player ${playerId} left room ${code}. Remaining: ${Object.keys(players).length}`);
      });
    } catch (err) {
      console.error(`[DATABASE ERROR] Leave room failed on Firestore transaction:`, err);
    }
  }

  /**
   * Toggle Ready
   */
  public async toggleReady(roomCode: string, playerId: string): Promise<void> {
    const code = roomCode.trim().toUpperCase();
    const roomRef = doc(this.db, 'rooms', code);

    try {
      await runTransaction(this.db, async (tx) => {
        const snap = await tx.get(roomRef);
        if (!snap.exists()) return;

        const room = snap.data() as FirestoreRoom;
        if (room.currentPhase !== 'LOBBY') return;
        if (!room.players || !room.players[playerId]) return;

        const player = { ...room.players[playerId] };
        player.ready = !player.ready;

        const updatedPlayers = { ...room.players, [playerId]: player };
        tx.update(roomRef, {
          players: updatedPlayers,
          updatedAt: Date.now()
        });
      });
    } catch (err) {
      console.error(`[DATABASE ERROR] Toggle ready failed:`, err);
    }
  }

  /**
   * Set Clue Duration (Host only, 10-120 seconds)
   */
  public async setClueDuration(roomCode: string, playerId: string, duration: number): Promise<{ success: boolean; error?: string }> {
    const code = roomCode.trim().toUpperCase();
    const roomRef = doc(this.db, 'rooms', code);

    try {
      const snap = await getDoc(roomRef);
      if (!snap.exists()) return { success: false, error: 'Room not found' };

      const room = snap.data() as FirestoreRoom;
      const player = room.players?.[playerId];
      if (!player || !player.isHost) {
        return { success: false, error: 'Only the host can configure the clue timer' };
      }

      // Clamp duration between 10 and 120 seconds
      const clampedDuration = Math.min(120, Math.max(10, Math.round(duration)));

      if (room.clueDuration === clampedDuration) {
        return { success: true };
      }

      await updateDoc(roomRef, {
        clueDuration: clampedDuration,
        updatedAt: Date.now()
      });

      console.log(`[TIMER CONFIG] Host ${player.name} updated clue timer to ${clampedDuration}s for room ${code}`);
      return { success: true };
    } catch (err: any) {
      console.error(`[DATABASE ERROR] Set clue duration failed:`, err);
      return { success: false, error: err.message || 'Failed to update timer' };
    }
  }

  /**
   * Start Game
   */
  public async startGame(roomCode: string, playerId: string): Promise<{ success: boolean; error?: string }> {
    const code = roomCode.trim().toUpperCase();
    const roomRef = doc(this.db, 'rooms', code);

    try {
      return await runTransaction(this.db, async (tx) => {
        const snap = await tx.get(roomRef);
        if (!snap.exists()) return { success: false, error: 'Room not found' };

        const room = snap.data() as FirestoreRoom;
        const player = room.players[playerId];
        if (!player || !player.isHost) {
          return { success: false, error: 'Only the host can start the game' };
        }

        const activePlayers = Object.values(room.players).filter(p => p.connected);
        if (activePlayers.length < 3) {
          return { success: false, error: 'At least 3 players are required to start.' };
        }

        const allReady = activePlayers.every(p => p.ready);
        if (!allReady) {
          return { success: false, error: 'All players must be ready before starting.' };
        }

        // Pick category and words, avoiding repeating the previous category
        const categoryData = getRandomCategory(room.category);
        const recentSecrets = room.recentSecretWords || [];
        const { words, secretWord, secretIndex } = selectRoundWords(categoryData, recentSecrets);

        // Pick Impostor
        const impostorIndex = Math.floor(Math.random() * activePlayers.length);
        const impostorPlayer = activePlayers[impostorIndex];

        // Prepare updated players
        const updatedPlayers: Record<string, FirestorePlayer> = {};
        for (const p of Object.values(room.players)) {
          updatedPlayers[p.playerId] = {
            ...p,
            status: 'active',
            role: p.connected ? (p.playerId === impostorPlayer.playerId ? 'IMPOSTOR' : 'INNOCENT') : null,
            clue: null,
            clueSubmitted: false,
            voteTargetId: null,
            hasVoted: false
          };
        }

        const durationSeconds = room.clueDuration || 30;
        const durationMs = durationSeconds * 1000;
        const roundEndTimestamp = Date.now() + durationMs;

        tx.update(roomRef, {
          roundNumber: (room.roundNumber || 0) + 1,
          category: categoryData.name,
          words,
          secretWord,
          secretWordIndex: secretIndex,
          recentSecretWords: [...recentSecrets.slice(-15), secretWord],
          impostorId: impostorPlayer.playerId,
          impostorGuess: null,
          winner: null,
          winReason: null,
          pointsAwarded: {},
          tiedPlayerIds: [],
          eliminatedOption: null,
          currentPhase: 'CLUE_PHASE',
          roundEndTimestamp,
          players: updatedPlayers,
          updatedAt: Date.now()
        });

        console.log(`[START GAME] Room ${code} round ${room.roundNumber + 1} started. Category: ${categoryData.name} with ${durationSeconds}s timer`);
        return { success: true };
      });
    } catch (err: any) {
      console.error(`[DATABASE ERROR] Start game failed:`, err);
      return { success: false, error: err.message || 'Failed to start game' };
    }
  }

  /**
   * Submit Clue
   */
  public async submitClue(roomCode: string, playerId: string, clueText: string): Promise<void> {
    const code = roomCode.trim().toUpperCase();
    const roomRef = doc(this.db, 'rooms', code);

    try {
      let shouldTransition = false;

      await runTransaction(this.db, async (tx) => {
        const snap = await tx.get(roomRef);
        if (!snap.exists()) return;

        const room = snap.data() as FirestoreRoom;
        if (room.currentPhase !== 'CLUE_PHASE') return;

        const player = room.players[playerId];
        if (!player || player.clueSubmitted || player.status === 'eliminated') return;

        // Sanitize clue
        let sanitized = clueText.trim().replace(/[\r\n\t]+/g, ' ');
        if (sanitized.length > 20) {
          sanitized = sanitized.substring(0, 20);
        }
        const words = sanitized.split(' ').filter(Boolean).slice(0, 3);
        sanitized = words.join(' ');

        const updatedPlayer = {
          ...player,
          clue: sanitized || 'No clue',
          clueSubmitted: true
        };

        const updatedPlayers = { ...room.players, [playerId]: updatedPlayer };

        // Check if all connected active players submitted
        const activePlayers = Object.values(updatedPlayers).filter(p => p.connected && p.status !== 'eliminated');
        const allSubmitted = activePlayers.every(p => p.clueSubmitted);

        if (allSubmitted) {
          shouldTransition = true;
          // Autofill any missing clues and transition to VOTING
          for (const p of Object.values(updatedPlayers)) {
            if (p.connected && !p.clueSubmitted) {
              p.clue = p.clue || 'NO CLUE';
              p.clueSubmitted = true;
            }
            p.voteTargetId = null;
            p.hasVoted = false;
          }

          tx.update(roomRef, {
            players: updatedPlayers,
            currentPhase: 'VOTING',
            roundEndTimestamp: null,
            revealEndTimestamp: null,
            tiedPlayerIds: [],
            updatedAt: Date.now()
          });
        } else {
          tx.update(roomRef, {
            players: updatedPlayers,
            updatedAt: Date.now()
          });
        }
      });

      if (shouldTransition) {
        console.log(`[CLUE PHASE COMPLETE] All players submitted clues in room ${code}. Transitioned to VOTING.`);
      }
    } catch (err) {
      console.error(`[DATABASE ERROR] Submit clue failed:`, err);
    }
  }

  /**
   * End Clue Phase (Timer expiry)
   */
  public async endCluePhase(roomCode: string): Promise<void> {
    const code = roomCode.trim().toUpperCase();
    const roomRef = doc(this.db, 'rooms', code);

    try {
      await runTransaction(this.db, async (tx) => {
        const snap = await tx.get(roomRef);
        if (!snap.exists()) return;

        const room = snap.data() as FirestoreRoom;
        if (room.currentPhase !== 'CLUE_PHASE') return;

        const updatedPlayers = { ...room.players };
        for (const p of Object.values(updatedPlayers)) {
          if (p.connected && !p.clueSubmitted) {
            p.clue = p.clue || 'NO CLUE';
            p.clueSubmitted = true;
          }
          p.voteTargetId = null;
          p.hasVoted = false;
        }

        tx.update(roomRef, {
          players: updatedPlayers,
          currentPhase: 'VOTING',
          roundEndTimestamp: null,
          revealEndTimestamp: null,
          tiedPlayerIds: [],
          updatedAt: Date.now()
        });
      });
      console.log(`[CLUE PHASE TIMEOUT] Clue phase timer elapsed for room ${code}. Transitioned to VOTING.`);
    } catch (err) {
      console.error(`[DATABASE ERROR] End clue phase failed:`, err);
    }
  }

  /**
   * Submit Vote
   */
  public async submitVote(roomCode: string, playerId: string, targetPlayerId: string): Promise<void> {
    const code = roomCode.trim().toUpperCase();
    const roomRef = doc(this.db, 'rooms', code);

    try {
      await runTransaction(this.db, async (tx) => {
        const snap = await tx.get(roomRef);
        if (!snap.exists()) return;

        const room = snap.data() as FirestoreRoom;
        if (room.currentPhase !== 'VOTING' && room.currentPhase !== 'TIEBREAK_VOTING' && room.currentPhase !== 'DISCUSSION') {
          return;
        }

        const voter = room.players[playerId];
        if (!voter || voter.hasVoted || voter.status === 'eliminated') return;
        if (playerId === targetPlayerId) return; // Cannot vote for self

        if (room.currentPhase === 'TIEBREAK_VOTING') {
          if (!room.tiedPlayerIds.includes(targetPlayerId)) return;
        } else {
          if (targetPlayerId !== 'NOBODY') {
            const target = room.players[targetPlayerId];
            if (!target || !target.connected) return;
          }
        }

        const updatedVoter = {
          ...voter,
          voteTargetId: targetPlayerId,
          hasVoted: true
        };

        const updatedPlayers = { ...room.players, [playerId]: updatedVoter };
        const activePlayers = Object.values(updatedPlayers).filter(p => p.connected && p.status !== 'eliminated');
        const allVoted = activePlayers.every(p => p.hasVoted);

        if (allVoted) {
          // Evaluate votes
          const isTiebreak = room.currentPhase === 'TIEBREAK_VOTING' && room.tiedPlayerIds.length > 0;
          const candidateIds = isTiebreak
            ? [...room.tiedPlayerIds]
            : [...activePlayers.map(p => p.playerId), 'NOBODY'];

          const voteCounts: Record<string, number> = {};
          candidateIds.forEach(id => { voteCounts[id] = 0; });

          activePlayers.forEach(p => {
            if (p.voteTargetId && voteCounts[p.voteTargetId] !== undefined) {
              voteCounts[p.voteTargetId]++;
            }
          });

          let maxVotes = -1;
          for (const count of Object.values(voteCounts)) {
            if (count > maxVotes) maxVotes = count;
          }

          const topVotedOptions = candidateIds.filter(id => voteCounts[id] === maxVotes);

          if (topVotedOptions.length > 1) {
            // Tiebreak
            for (const p of Object.values(updatedPlayers)) {
              p.voteTargetId = null;
              p.hasVoted = false;
            }

            tx.update(roomRef, {
              players: updatedPlayers,
              currentPhase: 'TIEBREAK_VOTING',
              tiedPlayerIds: topVotedOptions,
              updatedAt: Date.now()
            });
            return;
          }

          // Single highest voted
          const eliminatedOption = topVotedOptions[0];

          if (eliminatedOption !== 'NOBODY' && updatedPlayers[eliminatedOption]) {
            updatedPlayers[eliminatedOption].status = 'eliminated';
          }

          if (eliminatedOption === 'NOBODY') {
            // Impostor not caught
            const pointsAwarded: Record<string, number> = {};
            if (room.impostorId && updatedPlayers[room.impostorId]) {
              updatedPlayers[room.impostorId].score += 2;
              pointsAwarded[room.impostorId] = 2;
            }

            tx.update(roomRef, {
              players: updatedPlayers,
              eliminatedOption: 'NOBODY',
              winner: 'IMPOSTOR',
              winReason: 'IMPOSTOR_NOT_CAUGHT',
              currentPhase: 'ROUND_RESULT',
              pointsAwarded,
              updatedAt: Date.now()
            });
            return;
          }

          const isImpostor = eliminatedOption === room.impostorId;

          if (!isImpostor) {
            // Innocent eliminated, Impostor wins
            const pointsAwarded: Record<string, number> = {};
            if (room.impostorId && updatedPlayers[room.impostorId]) {
              updatedPlayers[room.impostorId].score += 2;
              pointsAwarded[room.impostorId] = 2;
            }

            tx.update(roomRef, {
              players: updatedPlayers,
              eliminatedOption,
              winner: 'IMPOSTOR',
              winReason: 'IMPOSTOR_NOT_CAUGHT',
              currentPhase: 'ROUND_RESULT',
              pointsAwarded,
              updatedAt: Date.now()
            });
          } else {
            // Impostor eliminated! Give chance to guess
            tx.update(roomRef, {
              players: updatedPlayers,
              eliminatedOption,
              currentPhase: 'IMPOSTOR_GUESS',
              updatedAt: Date.now()
            });
          }
        } else {
          tx.update(roomRef, {
            players: updatedPlayers,
            currentPhase: 'VOTING',
            updatedAt: Date.now()
          });
        }
      });
    } catch (err) {
      console.error(`[DATABASE ERROR] Submit vote failed:`, err);
    }
  }

  /**
   * Submit Impostor Guess
   */
  public async submitImpostorGuess(roomCode: string, playerId: string, guessedWord: string): Promise<void> {
    const code = roomCode.trim().toUpperCase();
    const roomRef = doc(this.db, 'rooms', code);

    try {
      await runTransaction(this.db, async (tx) => {
        const snap = await tx.get(roomRef);
        if (!snap.exists()) return;

        const room = snap.data() as FirestoreRoom;
        if (room.currentPhase !== 'IMPOSTOR_GUESS') return;
        if (playerId !== room.impostorId) return;

        const isCorrect = (guessedWord || '').toLowerCase().trim() === (room.secretWord || '').toLowerCase().trim();
        const updatedPlayers = { ...room.players };
        const pointsAwarded: Record<string, number> = {};

        let winner: 'IMPOSTOR' | 'INNOCENTS';
        let winReason: WinReason;

        if (isCorrect) {
          winner = 'IMPOSTOR';
          winReason = 'IMPOSTOR_GUESSED_WORD';
          if (room.impostorId && updatedPlayers[room.impostorId]) {
            updatedPlayers[room.impostorId].score += 3;
            pointsAwarded[room.impostorId] = 3;
          }
        } else {
          winner = 'INNOCENTS';
          winReason = 'IMPOSTOR_CAUGHT_FAILED_GUESS';
          for (const p of Object.values(updatedPlayers)) {
            if (p.role === 'INNOCENT') {
              p.score += 1;
              pointsAwarded[p.playerId] = 1;
            }
          }
        }

        tx.update(roomRef, {
          players: updatedPlayers,
          impostorGuess: guessedWord,
          winner,
          winReason,
          pointsAwarded,
          currentPhase: 'ROUND_RESULT',
          updatedAt: Date.now()
        });
      });
    } catch (err) {
      console.error(`[DATABASE ERROR] Submit impostor guess failed:`, err);
    }
  }

  /**
   * Next Round (Called by Host from ROUND_RESULT)
   */
  public async nextRound(roomCode: string, playerId: string): Promise<{ success: boolean; error?: string }> {
    const code = roomCode.trim().toUpperCase();
    const roomRef = doc(this.db, 'rooms', code);

    try {
      return await runTransaction(this.db, async (tx) => {
        const snap = await tx.get(roomRef);
        if (!snap.exists()) return { success: false, error: 'Room not found' };

        const room = snap.data() as FirestoreRoom;
        const player = room.players?.[playerId];
        if (!player || !player.isHost) {
          return { success: false, error: 'Only the host can start another round' };
        }

        const connectedPlayers = Object.values(room.players).filter(p => p.connected);
        if (connectedPlayers.length < 3) {
          return { success: false, error: 'At least 3 players are required to start.' };
        }

        // Pick new category and words, avoiding repeating the previous category
        const categoryData = getRandomCategory(room.category);
        const recentSecrets = room.recentSecretWords || [];
        const { words, secretWord, secretIndex } = selectRoundWords(categoryData, recentSecrets);

        // Pick new Impostor randomly
        const impostorIndex = Math.floor(Math.random() * connectedPlayers.length);
        const impostorPlayer = connectedPlayers[impostorIndex];

        // Reset all players to 'active' on new round!
        const updatedPlayers: Record<string, FirestorePlayer> = {};
        for (const p of Object.values(room.players)) {
          updatedPlayers[p.playerId] = {
            ...p,
            status: 'active',
            role: p.connected ? (p.playerId === impostorPlayer.playerId ? 'IMPOSTOR' : 'INNOCENT') : null,
            clue: null,
            clueSubmitted: false,
            voteTargetId: null,
            hasVoted: false
          };
        }

        const durationSeconds = room.clueDuration || 30;
        const durationMs = durationSeconds * 1000;
        const roundEndTimestamp = Date.now() + durationMs;

        tx.update(roomRef, {
          roundNumber: (room.roundNumber || 0) + 1,
          category: categoryData.name,
          words,
          secretWord,
          secretWordIndex: secretIndex,
          recentSecretWords: [...recentSecrets.slice(-15), secretWord],
          impostorId: impostorPlayer.playerId,
          impostorGuess: null,
          winner: null,
          winReason: null,
          pointsAwarded: {},
          tiedPlayerIds: [],
          eliminatedOption: null,
          currentPhase: 'CLUE_PHASE',
          roundEndTimestamp,
          players: updatedPlayers,
          updatedAt: Date.now()
        });

        console.log(`[NEXT ROUND] Room ${code} round ${room.roundNumber + 1} started. Category: ${categoryData.name} with ${durationSeconds}s timer`);
        return { success: true };
      });
    } catch (err: any) {
      console.error(`[DATABASE ERROR] Next round failed:`, err);
      return { success: false, error: err.message || 'Failed to start next round' };
    }
  }

  /**
   * Read Room (e.g. for HTTP GET /api/room/:code)
   */
  public async getRoom(roomCode: string): Promise<FirestoreRoom | null> {
    const code = (roomCode || '').trim().toUpperCase();
    if (!code) return null;

    try {
      const roomRef = doc(this.db, 'rooms', code);
      const snap = await getDoc(roomRef);
      if (!snap.exists()) return null;
      return snap.data() as FirestoreRoom;
    } catch (err) {
      console.error(`[DATABASE ERROR] Failed to fetch room ${code}:`, err);
      return null;
    }
  }

  /**
   * Client State Sanitizer (SECURITY: Protects secretWord and roles)
   */
  public getClientStateForPlayer(room: FirestoreRoom, playerId: string): ClientGameState {
    const playersList = Object.values(room.players || {});
    const me = room.players?.[playerId];
    const isImpostor = me?.role === 'IMPOSTOR';
    const isRoundOver = room.currentPhase === 'ROUND_RESULT';

    const voteCounts: Record<string, number> = {};
    if (isRoundOver) {
      for (const p of playersList) {
        if (p.voteTargetId) {
          voteCounts[p.voteTargetId] = (voteCounts[p.voteTargetId] || 0) + 1;
        }
      }
    }

    const playersPublic: PlayerPublic[] = playersList.map(p => {
      const showClue = room.currentPhase !== 'LOBBY' &&
                       room.currentPhase !== 'ROUND_START' &&
                       room.currentPhase !== 'CLUE_PHASE';
      return {
        id: p.playerId,
        name: p.name,
        isHost: p.isHost,
        isReady: p.ready,
        isConnected: p.connected,
        status: p.status || 'active',
        score: p.score || 0,
        clueSubmitted: p.clueSubmitted || false,
        hasVoted: p.hasVoted || false,
        clue: (showClue || p.playerId === playerId) ? (p.clue ?? undefined) : undefined,
        role: isRoundOver ? (p.role ?? undefined) : undefined,
        voteCount: isRoundOver ? (voteCounts[p.playerId] || 0) : undefined
      };
    });

    const impostorPlayer = room.impostorId ? room.players?.[room.impostorId] : null;

    const state: ClientGameState = {
      roomCode: room.roomCode,
      phase: room.currentPhase,
      roundNumber: room.roundNumber || 0,
      players: playersPublic,
      myPlayerId: playerId,
      isHost: me?.isHost || false,
      category: room.category || '',
      words: room.words || [],
      myRole: me?.role || null,
      clueDuration: room.clueDuration || 30,
      roundEndTimestamp: room.roundEndTimestamp,
      mySubmittedClue: me?.clue ?? undefined,
      tiedPlayerIds: room.tiedPlayerIds || [],
      myVoteTargetId: me?.voteTargetId ?? undefined
    };

    // Secret word ONLY sent to Innocents, or to everyone in ROUND_RESULT
    if (isRoundOver || (!isImpostor && me?.role === 'INNOCENT')) {
      state.secretWord = room.secretWord;
      state.secretWordIndex = room.secretWordIndex;
    }

    if (isRoundOver || room.currentPhase === 'IMPOSTOR_GUESS') {
      state.impostorId = room.impostorId ?? undefined;
      state.impostorName = impostorPlayer?.name;
    }

    if (isRoundOver) {
      state.impostorGuess = room.impostorGuess;
      state.winner = room.winner;
      state.winReason = room.winReason;
      state.pointsAwarded = room.pointsAwarded;
      state.eliminatedOption = room.eliminatedOption;
      state.eliminatedPlayerId = (room.eliminatedOption && room.eliminatedOption !== 'NOBODY') ? room.eliminatedOption : null;
      if (room.eliminatedOption === 'NOBODY') {
        state.eliminatedName = 'NOBODY';
      } else if (room.eliminatedOption) {
        state.eliminatedName = room.players?.[room.eliminatedOption]?.name || 'Unknown';
      }
    }

    return state;
  }

  /**
   * Broadcast state to local sockets connected to this instance
   */
  public broadcastRoomStateToLocalSockets(room: FirestoreRoom) {
    const sockets = this.roomSockets.get(room.roomCode);
    if (!sockets || sockets.size === 0) return;

    for (const ws of sockets) {
      if (ws.readyState === WebSocket.OPEN) {
        const mapping = this.socketPlayerMap.get(ws);
        if (mapping) {
          // If the player has left the room, do not send SYNC_STATE
          if (!room.players || !room.players[mapping.playerId]) {
            continue;
          }
          const clientState = this.getClientStateForPlayer(room, mapping.playerId);
          ws.send(JSON.stringify({
            type: 'SYNC_STATE',
            state: clientState
          }));
        }
      }
    }
  }

  /**
   * Send error if room was deleted
   */
  private broadcastRoomNotFound(roomCode: string) {
    const sockets = this.roomSockets.get(roomCode);
    if (!sockets) return;

    for (const ws of sockets) {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({
          type: 'ERROR',
          message: 'Room not found. Check the code and try again.'
        }));
      }
    }
  }
}

export const firestoreGameManager = new FirestoreGameManager();
