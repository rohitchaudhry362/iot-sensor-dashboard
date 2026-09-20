import { Router } from 'express';
import { getAllLatestReadings, getSensorReadings, getSensors } from '../../handlers/sensorHandlers';
import { validateParams, validateQuery } from '../../middleware/validate';
import { readingRangeSchema, sensorParamsSchema } from '../../validation/sensorReadingSchemas';

export const sensorRouter = Router();

sensorRouter.get('/', getSensors);

sensorRouter.get('/all/readings/latest', getAllLatestReadings);

sensorRouter.get(
  '/:sensorId/readings',
  validateParams(sensorParamsSchema),
  validateQuery(readingRangeSchema),
  getSensorReadings,
);
