import { asyncHandler } from '../lib/asyncHandler';
import { notFound } from '../lib/errors';
import { findLatestReadings, findSensorReadings, listSensors, sensorExists } from '../services/sensorService';
import type { ReadingRangeQuery, SensorParams } from '../validation/sensorReadingSchemas';

export const getSensors = asyncHandler(async (_req, res) => {
  res.json({ sensors: await listSensors() });
});

export const getAllLatestReadings = asyncHandler(async (_req, res) => {
  res.json({ readings: await findLatestReadings() });
});

export const getSensorReadings = asyncHandler(async (req, res) => {
  const { sensorId } = req.params as unknown as SensorParams;
  const { from, to, metricName } = req.query as unknown as ReadingRangeQuery;

  if (!(await sensorExists(sensorId))) throw notFound('Sensor not found');

  res.json({ from, to, readings: await findSensorReadings({ sensorId, from, to, metricName }) });
});
