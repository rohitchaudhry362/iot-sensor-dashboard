import { apiRequest } from './client';
import type { ActivityResponse, LatestReadingsResponse, SensorReadingsResponse, SensorsResponse } from './types';

export const fetchSensors = (): Promise<SensorsResponse> => apiRequest<SensorsResponse>('/api/sensor');

export const fetchLatestReadings = (): Promise<LatestReadingsResponse> =>
  apiRequest<LatestReadingsResponse>('/api/sensor/all/readings/latest');

export interface SensorReadingsRequest {
  sensorId: number;
  metricName: string;
  from: Date;
  to: Date;
}

export const fetchSensorReadings = ({
  sensorId,
  metricName,
  from,
  to,
}: SensorReadingsRequest): Promise<SensorReadingsResponse> => {
  const query = new URLSearchParams({ metricName, from: from.toISOString(), to: to.toISOString() });
  return apiRequest<SensorReadingsResponse>(`/api/sensor/${sensorId}/readings?${query.toString()}`);
};

// Half a day: 48 quarter-hour buckets, few enough that every point on the chart can carry its own label.
export const ACTIVITY_WINDOW_HOURS = 12;

// The window is requested rather than left to the endpoint's own 24-hour default, so the chart and the tile
// share one cache entry instead of fetching overlapping ranges.
export const fetchActivity = (): Promise<ActivityResponse> => {
  const from = new Date(Date.now() - ACTIVITY_WINDOW_HOURS * 60 * 60 * 1000).toISOString();
  return apiRequest<ActivityResponse>(`/api/activity?from=${encodeURIComponent(from)}`);
};
