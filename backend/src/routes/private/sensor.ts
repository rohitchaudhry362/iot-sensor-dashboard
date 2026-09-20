import { Router } from 'express';
import { getAllLatestReadings, getSensors } from '../../handlers/sensorHandlers';

export const sensorRouter = Router();

sensorRouter.get('/', getSensors);

sensorRouter.get('/all/readings/latest', getAllLatestReadings);
