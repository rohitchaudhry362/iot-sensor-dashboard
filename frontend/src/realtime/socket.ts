import { io, type Socket } from 'socket.io-client';
import { getAccessToken, refreshSession } from '../api/client';
import type { ActivityUpdateEvent, SensorDetectedEvent, SensorUpdateEvent } from './events';

export interface LiveDataHandlers {
  onSensorUpdate: (event: SensorUpdateEvent) => void;
  onSensorDetected: (event: SensorDetectedEvent) => void;
  onActivityUpdate: (event: ActivityUpdateEvent) => void;
}

export const connectLiveData = (handlers: LiveDataHandlers): (() => void) => {
  const socket: Socket = io({ auth: { token: getAccessToken() } });

  let isReauthenticating = false;

  // The server closes a socket the moment its access token expires, and will not accept the same token again.
  // Socket.io deliberately does not retry a disconnect the server asked for, so the reconnect is ours to do,
  // with a token we have to fetch first.
  const reauthenticateAndReconnect = (): void => {
    if (isReauthenticating) return;
    isReauthenticating = true;
    refreshSession()
      .then(() => {
        socket.auth = { token: getAccessToken() };
        socket.connect();
      })
      // The session is genuinely over. Staying disconnected is correct: the next API call fails the same way
      // and the app's own session handling signs the user out, rather than two paths racing to do it.
      .catch(() => undefined)
      .finally(() => {
        isReauthenticating = false;
      });
  };

  socket.on('disconnect', (reason) => {
    if (reason === 'io server disconnect') reauthenticateAndReconnect();
  });

  socket.on('connect_error', (error) => {
    // Anything else (the backend being down, for instance) is socket.io's own business: it keeps retrying.
    if (error.message === 'unauthorized') reauthenticateAndReconnect();
  });

  socket.on('sensor:update', handlers.onSensorUpdate);
  socket.on('sensor:detected', handlers.onSensorDetected);
  socket.on('activity:update', handlers.onActivityUpdate);

  return () => {
    socket.removeAllListeners();
    socket.close();
  };
};
