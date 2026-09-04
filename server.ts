import express from 'express';
import http from 'http';
import fs from 'fs';
import path from 'path';
import { WebSocketServer, WebSocket } from 'ws';
import { createServer as createViteServer } from 'vite';
import { firestoreGameManager } from './server/firestoreGameManager';
import { ClientAction } from './src/types/game';

async function startServer() {
  const app = express();
  const server = http.createServer(app);
  const PORT = 3000;

  app.use(express.json());

  // Health check API
  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: Date.now() });
  });

  // Room check API - Authoritative Firestore lookup
  app.get('/api/room/:code', async (req, res) => {
    try {
      const code = req.params.code.toUpperCase().trim();
      const room = await firestoreGameManager.getRoom(code);
      if (!room) {
        res.status(404).json({ exists: false, error: 'Room not found' });
        return;
      }
      const connectedCount = Object.values(room.players || {}).filter(p => p.connected).length;
      res.json({
        exists: true,
        phase: room.currentPhase,
        playerCount: connectedCount,
        isFull: connectedCount >= 6
      });
    } catch (err: any) {
      console.error('[DATABASE ERROR] Room lookup API error:', err);
      res.status(500).json({ exists: false, error: 'Database error' });
    }
  });

  // WebSocket Server
  const wss = new WebSocketServer({ server, path: '/ws' });

  // Ping-pong keepalive interval
  const interval = setInterval(() => {
    wss.clients.forEach((ws: any) => {
      if (ws.isAlive === false) {
        return ws.terminate();
      }
      ws.isAlive = false;
      ws.ping();
    });
  }, 30000);

  wss.on('close', () => {
    clearInterval(interval);
  });

  wss.on('connection', (ws: any) => {
    ws.isAlive = true;
    ws.on('pong', () => {
      ws.isAlive = true;
    });

    let activePlayerId: string | null = null;
    let activeRoomCode: string | null = null;

    ws.on('message', async (rawMessage: string) => {
      try {
        const action: ClientAction = JSON.parse(rawMessage.toString());

        switch (action.type) {
          case 'CREATE_ROOM': {
            try {
              const { room, player } = await firestoreGameManager.createRoom(
                action.playerName,
                ws,
                (action as any).playerId
              );
              activePlayerId = player.playerId;
              activeRoomCode = room.roomCode;

              ws.send(JSON.stringify({
                type: 'ROOM_CREATED',
                roomCode: room.roomCode,
                playerId: player.playerId
              }));

              const clientState = firestoreGameManager.getClientStateForPlayer(room, player.playerId);
              ws.send(JSON.stringify({
                type: 'SYNC_STATE',
                state: clientState
              }));
            } catch (err: any) {
              console.error('[CREATE ROOM ERROR]', err);
              ws.send(JSON.stringify({
                type: 'ERROR',
                code: err.code || 'CREATE_ERROR',
                message: err.message || 'Failed to create room'
              }));
            }
            break;
          }

          case 'JOIN_ROOM': {
            try {
              const { room, player } = await firestoreGameManager.joinRoom(
                action.roomCode,
                action.playerName,
                ws,
                action.playerId
              );
              activePlayerId = player.playerId;
              activeRoomCode = room.roomCode;

              ws.send(JSON.stringify({
                type: 'ROOM_JOINED',
                roomCode: room.roomCode,
                playerId: player.playerId
              }));

              const clientState = firestoreGameManager.getClientStateForPlayer(room, player.playerId);
              ws.send(JSON.stringify({
                type: 'SYNC_STATE',
                state: clientState
              }));
            } catch (err: any) {
              ws.send(JSON.stringify({
                type: 'ERROR',
                code: err.code || 'ROOM_NOT_FOUND',
                message: err.message || 'Room not found. Check the code and try again.'
              }));
            }
            break;
          }

          case 'RECONNECT': {
            try {
              const { room, player } = await firestoreGameManager.reconnect(
                action.roomCode,
                ws,
                action.playerId
              );
              activePlayerId = player.playerId;
              activeRoomCode = room.roomCode;

              ws.send(JSON.stringify({
                type: 'ROOM_JOINED',
                roomCode: room.roomCode,
                playerId: player.playerId
              }));

              const clientState = firestoreGameManager.getClientStateForPlayer(room, player.playerId);
              ws.send(JSON.stringify({
                type: 'SYNC_STATE',
                state: clientState
              }));
            } catch (err: any) {
              ws.send(JSON.stringify({
                type: 'ERROR',
                code: err.code || 'ROOM_NOT_FOUND',
                message: err.message || 'Room not found. Check the code and try again.'
              }));
            }
            break;
          }

          case 'TOGGLE_READY': {
            if (activePlayerId && activeRoomCode) {
              await firestoreGameManager.toggleReady(activeRoomCode, activePlayerId);
            }
            break;
          }

          case 'SET_CLUE_DURATION': {
            if (activePlayerId && activeRoomCode) {
              await firestoreGameManager.setClueDuration(activeRoomCode, activePlayerId, action.duration);
            }
            break;
          }

          case 'START_GAME': {
            if (activePlayerId && activeRoomCode) {
              const res = await firestoreGameManager.startGame(activeRoomCode, activePlayerId);
              if (!res.success && res.error) {
                ws.send(JSON.stringify({ type: 'ERROR', message: res.error }));
              }
            }
            break;
          }

          case 'SUBMIT_CLUE': {
            if (activePlayerId && activeRoomCode) {
              await firestoreGameManager.submitClue(activeRoomCode, activePlayerId, action.clue);
            }
            break;
          }

          case 'START_VOTING': {
            if (activePlayerId && activeRoomCode) {
              await firestoreGameManager.endCluePhase(activeRoomCode);
            }
            break;
          }

          case 'SUBMIT_VOTE': {
            if (activePlayerId && activeRoomCode) {
              await firestoreGameManager.submitVote(activeRoomCode, activePlayerId, action.targetPlayerId);
            }
            break;
          }

          case 'SUBMIT_IMPOSTOR_GUESS': {
            if (activePlayerId && activeRoomCode) {
              await firestoreGameManager.submitImpostorGuess(activeRoomCode, activePlayerId, action.word);
            }
            break;
          }

          case 'NEXT_ROUND': {
            if (activePlayerId && activeRoomCode) {
              const res = await firestoreGameManager.nextRound(activeRoomCode, activePlayerId);
              if (!res.success && res.error) {
                ws.send(JSON.stringify({ type: 'ERROR', message: res.error }));
              }
            }
            break;
          }

          case 'LEAVE_ROOM': {
            if (activePlayerId && activeRoomCode) {
              await firestoreGameManager.leaveRoom(activeRoomCode, activePlayerId);
              activePlayerId = null;
              activeRoomCode = null;
            }
            break;
          }
        }
      } catch (err) {
        console.error('Failed to parse WebSocket message:', err);
      }
    });

    ws.on('close', async () => {
      await firestoreGameManager.handleSocketDisconnect(ws);
    });

    ws.on('error', (err: any) => {
      console.error('WebSocket client error:', err);
    });
  });

  // Vite middleware in dev, Static in prod
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on port ${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
