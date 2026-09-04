import { useEffect, useRef, useState, useCallback } from 'react';
import { ClientAction, ClientGameState, ServerMessage } from '../types/game';
import { sound } from '../services/sound';
import confetti from 'canvas-confetti';

export type ConnectionStatus = 'CONNECTING' | 'CONNECTED' | 'DISCONNECTED';

export function useGameSocket() {
  const [status, setStatus] = useState<ConnectionStatus>('CONNECTING');
  const [gameState, setGameState] = useState<ClientGameState | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [myPlayerId, setMyPlayerId] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('20words_player_id');
      if (saved) return saved;
      const newId = 'p_' + Math.random().toString(36).substring(2, 10);
      localStorage.setItem('20words_player_id', newId);
      return newId;
    }
    return 'p_' + Math.random().toString(36).substring(2, 10);
  });

  const [savedName, setSavedName] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('20words_player_name') || '';
    }
    return '';
  });

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimerRef = useRef<NodeJS.Timeout | null>(null);
  const prevPhaseRef = useRef<string | null>(null);

  const send = useCallback((action: ClientAction) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(action));
    } else {
      console.warn('Socket not connected, cannot send action:', action);
    }
  }, []);

  const connect = useCallback(() => {
    if (typeof window === 'undefined') return;

    // Clean up existing
    if (wsRef.current) {
      try {
        wsRef.current.close();
      } catch {}
      wsRef.current = null;
    }

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.host;
    const wsUrl = `${protocol}//${host}/ws`;

    setStatus('CONNECTING');
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      setStatus('CONNECTED');
      setErrorMessage(null);

      // Try reconnecting to previous room if any
      const savedRoom = localStorage.getItem('20words_room_code');
      const savedId = localStorage.getItem('20words_player_id');
      if (savedRoom && savedId) {
        ws.send(JSON.stringify({
          type: 'RECONNECT',
          roomCode: savedRoom,
          playerId: savedId
        }));
      }
    };

    ws.onmessage = (event) => {
      try {
        const msg: ServerMessage = JSON.parse(event.data);

        if (msg.type === 'SYNC_STATE') {
          const newState = msg.state;
          setGameState(newState);

          // Phase transition sound effects
          if (prevPhaseRef.current !== newState.phase) {
            if (newState.phase === 'CLUE_PHASE') {
              sound.playRoundStart();
            } else if (newState.phase === 'CLUE_REVEAL') {
              sound.playReveal();
            } else if (newState.phase === 'ROUND_RESULT') {
              if (newState.winner === 'INNOCENTS' && newState.myRole === 'INNOCENT') {
                sound.playVictory();
                confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
              } else if (newState.winner === 'IMPOSTOR' && newState.myRole === 'IMPOSTOR') {
                sound.playVictory();
                confetti({ particleCount: 100, spread: 90, origin: { y: 0.6 } });
              } else {
                sound.playReveal();
              }
            }
            prevPhaseRef.current = newState.phase;
          }

          if (newState.roomCode) {
            localStorage.setItem('20words_room_code', newState.roomCode);
          }
        } else if (msg.type === 'ROOM_CREATED' || msg.type === 'ROOM_JOINED') {
          localStorage.setItem('20words_room_code', msg.roomCode);
          localStorage.setItem('20words_player_id', msg.playerId);
          setMyPlayerId(msg.playerId);
          setErrorMessage(null);
          sound.playPop();
        } else if (msg.type === 'ERROR') {
          setErrorMessage(msg.message);
          sound.vibrate(80);
        }
      } catch (err) {
        console.error('Failed to parse incoming socket message:', err);
      }
    };

    ws.onerror = () => {
      setStatus('DISCONNECTED');
    };

    ws.onclose = () => {
      setStatus('DISCONNECTED');
      wsRef.current = null;
      // Reconnect after delay
      if (reconnectTimerRef.current) clearTimeout(reconnectTimerRef.current);
      reconnectTimerRef.current = setTimeout(() => {
        connect();
      }, 2500);
    };
  }, []);

  useEffect(() => {
    connect();
    return () => {
      if (reconnectTimerRef.current) clearTimeout(reconnectTimerRef.current);
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [connect]);

  // Action helpers
  const createRoom = (playerName: string) => {
    const name = playerName.trim();
    if (!name) return;
    localStorage.setItem('20words_player_name', name);
    setSavedName(name);
    send({ type: 'CREATE_ROOM', playerName: name });
  };

  const joinRoom = (roomCode: string, playerName: string) => {
    const name = playerName.trim();
    const code = roomCode.toUpperCase().trim();
    if (!name || !code) return;
    localStorage.setItem('20words_player_name', name);
    setSavedName(name);
    send({ type: 'JOIN_ROOM', roomCode: code, playerName: name, playerId: myPlayerId });
  };

  const toggleReady = () => {
    sound.playPop();
    send({ type: 'TOGGLE_READY' });
  };

  const setClueDuration = (duration: number) => {
    sound.playPop();
    send({ type: 'SET_CLUE_DURATION', duration });
  };

  const startGame = () => {
    sound.playPop();
    send({ type: 'START_GAME' });
  };

  const submitClue = (clue: string) => {
    sound.playSubmit();
    send({ type: 'SUBMIT_CLUE', clue });
  };

  const startVoting = () => {
    sound.playPop();
    send({ type: 'START_VOTING' });
  };

  const submitVote = (targetPlayerId: string) => {
    sound.playVote();
    send({ type: 'SUBMIT_VOTE', targetPlayerId });
  };

  const submitImpostorGuess = (word: string) => {
    sound.playPop();
    send({ type: 'SUBMIT_IMPOSTOR_GUESS', word });
  };

  const nextRound = () => {
    sound.playPop();
    send({ type: 'NEXT_ROUND' });
  };

  const leaveRoom = () => {
    sound.playPop();
    localStorage.removeItem('20words_room_code');
    send({ type: 'LEAVE_ROOM' });
    setGameState(null);
  };

  const clearError = () => {
    setErrorMessage(null);
  };

  return {
    status,
    gameState,
    myPlayerId,
    savedName,
    errorMessage,
    createRoom,
    joinRoom,
    toggleReady,
    setClueDuration,
    startGame,
    submitClue,
    startVoting,
    submitVote,
    submitImpostorGuess,
    nextRound,
    leaveRoom,
    clearError
  };
}
