import express from 'express';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import { WebSocketServer, WebSocket } from 'ws';
import { createServer as createViteServer } from 'vite';
import { gameManager } from './server/gameState';
import { ClientAction } from './src/types/game';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const server = http.createServer(app);
  const PORT = 3000;

  app.use(express.json());

  // Health check API
  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: Date.now() });
  });

  // Room check API
  app.get('/api/room/:code', (req, res) => {
    const code = req.params.code.toUpperCase();
    const room = gameManager.getRoom(code);
    if (!room) {
      res.status(404).json({ exists: false, error: 'Room not found' });
      return;
    }
    const connectedCount = Array.from(room.players.values()).filter(p => p.isConnected).length;
    res.json({
      exists: true,
      phase: room.phase,
      playerCount: connectedCount,
      isFull: connectedCount >= 6
    });
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

    ws.on('message', (rawMessage: string) => {
      try {
        const action: ClientAction = JSON.parse(rawMessage.toString());

        switch (action.type) {
          case 'CREATE_ROOM': {
            const { room, player } = gameManager.createRoom(action.playerName, ws, (action as any).playerId);
            activePlayerId = player.id;
            activeRoomCode = room.code;

            ws.send(JSON.stringify({
              type: 'ROOM_CREATED',
              roomCode: room.code,
              playerId: player.id
            }));

            gameManager.broadcastRoomState(room);
            break;
          }

          case 'JOIN_ROOM': {
            const result = gameManager.joinRoom(action.roomCode, action.playerName, ws, action.playerId);
            if ('error' in result) {
              ws.send(JSON.stringify({ type: 'ERROR', message: result.error }));
            } else {
              activePlayerId = result.player.id;
              activeRoomCode = result.room.code;

              ws.send(JSON.stringify({
                type: 'ROOM_JOINED',
                roomCode: result.room.code,
                playerId: result.player.id
              }));

              gameManager.broadcastRoomState(result.room);
            }
            break;
          }

          case 'RECONNECT': {
            const result = gameManager.joinRoom(action.roomCode, '', ws, action.playerId);
            if ('error' in result) {
              ws.send(JSON.stringify({ type: 'ERROR', message: result.error }));
            } else {
              activePlayerId = result.player.id;
              activeRoomCode = result.room.code;

              ws.send(JSON.stringify({
                type: 'ROOM_JOINED',
                roomCode: result.room.code,
                playerId: result.player.id
              }));

              gameManager.broadcastRoomState(result.room);
            }
            break;
          }

          case 'TOGGLE_READY': {
            if (activePlayerId && activeRoomCode) {
              gameManager.toggleReady(activePlayerId, activeRoomCode);
            }
            break;
          }

          case 'START_GAME': {
            if (activePlayerId && activeRoomCode) {
              const res = gameManager.startGame(activePlayerId, activeRoomCode);
              if (!res.success && res.error) {
                ws.send(JSON.stringify({ type: 'ERROR', message: res.error }));
              }
            }
            break;
          }

          case 'SUBMIT_CLUE': {
            if (activePlayerId && activeRoomCode) {
              gameManager.submitClue(activePlayerId, activeRoomCode, action.clue);
            }
            break;
          }

          case 'START_VOTING': {
            if (activePlayerId && activeRoomCode) {
              gameManager.startVotingPhase(activePlayerId, activeRoomCode);
            }
            break;
          }

          case 'SUBMIT_VOTE': {
            if (activePlayerId && activeRoomCode) {
              gameManager.submitVote(activePlayerId, activeRoomCode, action.targetPlayerId);
            }
            break;
          }

          case 'SUBMIT_IMPOSTOR_GUESS': {
            if (activePlayerId && activeRoomCode) {
              gameManager.submitImpostorGuess(activePlayerId, activeRoomCode, action.word);
            }
            break;
          }

          case 'NEXT_ROUND': {
            if (activePlayerId && activeRoomCode) {
              const res = gameManager.nextRound(activePlayerId, activeRoomCode);
              if (!res.success && res.error) {
                ws.send(JSON.stringify({ type: 'ERROR', message: res.error }));
              }
            }
            break;
          }

          case 'LEAVE_ROOM': {
            if (activePlayerId && activeRoomCode) {
              gameManager.leaveRoom(activePlayerId, activeRoomCode);
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

    ws.on('close', () => {
      gameManager.handleDisconnect(ws);
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
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`20 Words server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
