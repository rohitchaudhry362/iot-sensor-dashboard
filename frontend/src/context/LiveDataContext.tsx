import { useQuery } from '@tanstack/react-query';
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { fetchActivity, fetchLatestReadings, fetchSensors } from '../api/dashboard';
import type { ActivityBucket, LatestReading, Sensor } from '../api/types';
import type { NetworkStatus } from '../realtime/events';
import { connectLiveData } from '../realtime/socket';
import { useAuth } from './AuthContext';

// The metric names the backend stores, which arrive on every sensor:update.
const TEMPERATURE = 'temperature';
const HUMIDITY = 'humidity';

// What is kept in state. The sensor's name is stored rather than its location, because the location is only a
// label and resolving it needs the sensor list, which may still be loading when an event arrives.
interface DetectionState {
  occurredAt: string;
  sensorName: string;
}

interface MeasurementState extends DetectionState {
  value: number;
  unit: string;
}

// What consumers see: the same values with the location filled in.
export interface Measurement {
  value: number;
  unit: string;
  occurredAt: string;
  location: string;
}

export interface Detection {
  occurredAt: string;
  location: string;
}

export interface ActivityPoint {
  time: string;
  minutes: number;
}

export interface NetworkStatusValue {
  status: NetworkStatus;
  changedAt: string;
}

export interface LiveDataValue {
  temperature: Measurement | null;
  humidity: Measurement | null;
  door: Detection | null;
  activity: ActivityPoint | null;
  networkStatus: NetworkStatusValue | null;
  isLoading: boolean;
  isError: boolean;
}

const EMPTY_LIVE_DATA: LiveDataValue = {
  temperature: null,
  humidity: null,
  door: null,
  activity: null,
  networkStatus: null,
  isLoading: false,
  isError: false,
};

export const LiveDataContext = createContext<LiveDataValue>(EMPTY_LIVE_DATA);

const locationOf = (sensors: Sensor[] | undefined, sensorName: string): string =>
  sensors?.find((sensor) => sensor.name === sensorName)?.location ?? '';

const measurementFromSnapshot = (readings: LatestReading[], metricName: string): MeasurementState | null => {
  const row = readings.find((reading) => reading.metricName === metricName);
  if (!row || row.value === null) return null;
  return { value: row.value, unit: row.unit ?? '', occurredAt: row.occurredAt, sensorName: row.sensorName };
};

// A device that only signals events is the row with no metric at all; that row is its last detection.
const detectionFromSnapshot = (readings: LatestReading[]): DetectionState | null => {
  const row = readings.find((reading) => reading.metricName === null);
  return row ? { occurredAt: row.occurredAt, sensorName: row.sensorName } : null;
};

// Buckets arrive oldest first, for charting, so the newest is the last one.
const activityFromSnapshot = (buckets: ActivityBucket[]): ActivityPoint | null => {
  const latest = buckets[buckets.length - 1];
  return latest ? { time: latest.time, minutes: latest.activity } : null;
};

// Holds the four values the dashboard shows. Each is filled once from the REST snapshot when the app loads,
// and from then on only socket events move it. That gives current state a single owner: there is no merging
// at read time and no timestamps to compare, because nothing else ever writes to these slots.
export const LiveDataProvider = ({ children }: { children: ReactNode }) => {
  const { state: authState } = useAuth();
  const isAuthenticated = authState.status === 'authenticated';

  const sensorsQuery = useQuery({ queryKey: ['sensors'], queryFn: fetchSensors, enabled: isAuthenticated });
  const readingsQuery = useQuery({
    queryKey: ['latest-readings'],
    queryFn: fetchLatestReadings,
    enabled: isAuthenticated,
  });
  const activityQuery = useQuery({ queryKey: ['activity'], queryFn: fetchActivity, enabled: isAuthenticated });

  const [temperature, setTemperature] = useState<MeasurementState | null>(null);
  const [humidity, setHumidity] = useState<MeasurementState | null>(null);
  const [door, setDoor] = useState<DetectionState | null>(null);
  const [activity, setActivity] = useState<ActivityPoint | null>(null);
  // Socket-only, with no REST snapshot behind it: presence is not stored anywhere, so the server pushes the
  // current value the moment this browser connects rather than answering a request for it.
  const [networkStatus, setNetworkStatus] = useState<NetworkStatusValue | null>(null);

  const readings = readingsQuery.data?.readings;
  const buckets = activityQuery.data?.buckets;
  const sensors = sensorsQuery.data?.sensors;

  // `current ?? fromSnapshot` fills a slot only while it is still empty, so a refetch can never overwrite a
  // value a socket event has already delivered.
  useEffect(() => {
    if (!readings) return;
    setTemperature((current) => current ?? measurementFromSnapshot(readings, TEMPERATURE));
    setHumidity((current) => current ?? measurementFromSnapshot(readings, HUMIDITY));
    setDoor((current) => current ?? detectionFromSnapshot(readings));
  }, [readings]);

  useEffect(() => {
    if (!buckets) return;
    setActivity((current) => current ?? activityFromSnapshot(buckets));
  }, [buckets]);

  useEffect(() => {
    if (!isAuthenticated) return;
    return connectLiveData({
      // A reading for any other metric is ignored rather than shown somewhere it does not belong.
      onSensorUpdate: (event) => {
        const reading = {
          value: event.value,
          unit: event.unit,
          occurredAt: event.occurredAt,
          sensorName: event.sensorName,
        };
        if (event.metricName === TEMPERATURE) setTemperature(reading);
        else if (event.metricName === HUMIDITY) setHumidity(reading);
      },
      onSensorDetected: (event) => setDoor({ occurredAt: event.occurredAt, sensorName: event.sensorName }),
      onActivityUpdate: (event) => setActivity({ time: event.time, minutes: event.activity }),
      onNetworkStatus: (event) => setNetworkStatus({ status: event.status, changedAt: event.changedAt }),
      // The readings above are left alone: each one is still the last thing that device actually reported, and
      // says its own age. Presence is the one value that would become a lie, because it is a claim about now.
      onConnectionLost: () => setNetworkStatus(null),
    });
  }, [isAuthenticated]);

  const isLoading = sensorsQuery.isLoading || readingsQuery.isLoading || activityQuery.isLoading;
  const isError = sensorsQuery.isError || readingsQuery.isError || activityQuery.isError;

  const value = useMemo<LiveDataValue>(
    () => ({
      temperature: temperature && { ...temperature, location: locationOf(sensors, temperature.sensorName) },
      humidity: humidity && { ...humidity, location: locationOf(sensors, humidity.sensorName) },
      door: door && { occurredAt: door.occurredAt, location: locationOf(sensors, door.sensorName) },
      activity,
      networkStatus,
      isLoading,
      isError,
    }),
    [temperature, humidity, door, activity, networkStatus, sensors, isLoading, isError],
  );

  return <LiveDataContext.Provider value={value}>{children}</LiveDataContext.Provider>;
};

export const useLiveData = (): LiveDataValue => useContext(LiveDataContext);
