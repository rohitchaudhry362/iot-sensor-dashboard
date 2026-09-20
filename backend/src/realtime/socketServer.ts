import type { Server as HttpServer } from 'node:http';
import { Server } from 'socket.io';
import { env } from '../config/env';
import { logger } from '../lib/logger';
import { verifyAccessToken } from '../lib/tokens';
import type { ServerToClientEvents } from './events';

export interface SocketServer {
  stop: () => Promise<void>;
}

// Set by the handshake middleware once the access token has been verified.
interface SocketData {
  userUuid: string;
  expiresAt: number;
}

// The browser never emits: this socket is push-only, and every write goes over REST where validation, the
// error shape and request logging already live. Two write paths would mean securing two write paths.
type NoEvents = Record<string, never>;

type AppSocketServer = Server<NoEvents, ServerToClientEvents, NoEvents, SocketData>;

let runningServer: AppSocketServer | null = null;

export const getSocketServer = (): AppSocketServer | null => runningServer;

export const startSocketServer = (httpServer: HttpServer): SocketServer => {
  const io: AppSocketServer = new Server(httpServer, {
    cors: { origin: env.CORS_ORIGIN, credentials: true },
    maxHttpBufferSize: 1024,
  });

  io.use((socket, next) => {
    const token: unknown = socket.handshake.auth.token;
    const claims = typeof token === 'string' ? verifyAccessToken(token) : null;
    if (!claims) {
      next(new Error('unauthorized'));
      return;
    }
    socket.data.userUuid = claims.userUuid;
    socket.data.expiresAt = claims.expiresAt;
    next();
  });

  io.on('connection', (socket) => {
    // A socket must not outlive the token that authorised it, or a logged-out or revoked session would keep
    // receiving events for as long as the connection stayed open. The client reconnects with a fresh token.
    const millisecondsUntilExpiry = Math.max(0, socket.data.expiresAt * 1000 - Date.now());
    const expiryTimer = setTimeout(() => {
      logger.info(`Disconnecting socket ${socket.id}: access token expired`);
      socket.disconnect(true);
    }, millisecondsUntilExpiry);

    socket.on('disconnect', (reason) => {
      clearTimeout(expiryTimer);
      logger.info(`Socket ${socket.id} disconnected: ${reason}`);
    });

    logger.info(`Socket ${socket.id} connected for user ${socket.data.userUuid}`);
  });

  runningServer = io;
  logger.info('Socket.io server attached to the HTTP server');

  return {
    // Sockets are disconnected first so clients see a clean close and start reconnecting, rather than a dropped
    // TCP connection. io.close() also closes the HTTP server it is attached to (see server.ts).
    stop: async () => {
      io.disconnectSockets(true);
      await new Promise<void>((resolve) => io.close(() => resolve()));
      runningServer = null;
    },
  };
};
