import { asyncHandler } from '../lib/asyncHandler';
import { findLatestReadings, listSensors } from '../services/sensorService';

export const getSensors = asyncHandler(async (_req, res) => {
  res.json({ sensors: await listSensors() });
});

export const getAllLatestReadings = asyncHandler(async (_req, res) => {
  res.json({ readings: await findLatestReadings() });
});
