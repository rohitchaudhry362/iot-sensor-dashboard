import { apiRequest } from './client';
import type { ActivityResponse, LatestReadingsResponse, SensorsResponse } from './types';

export const fetchSensors = (): Promise<SensorsResponse> => apiRequest<SensorsResponse>('/api/sensor');

export const fetchLatestReadings = (): Promise<LatestReadingsResponse> =>
  apiRequest<LatestReadingsResponse>('/api/sensor/all/readings/latest');

export const fetchActivity = (): Promise<ActivityResponse> => apiRequest<ActivityResponse>('/api/activity');
