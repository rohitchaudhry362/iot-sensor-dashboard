import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { ACTIVITY_WINDOW_HOURS, fetchActivity } from '../api/dashboard';
import { useLiveData, type ActivityPoint } from '../context/LiveDataContext';

const MAX_POINTS = ACTIVITY_WINDOW_HOURS * 4;

const withPoint = (history: ActivityPoint[], point: ActivityPoint): ActivityPoint[] =>
  [...history.filter((existing) => existing.time !== point.time), point]
    .sort((earlier, later) => earlier.time.localeCompare(later.time))
    .slice(-MAX_POINTS);

export interface ActivityHistory {
  points: ActivityPoint[];
  isLoading: boolean;
  isError: boolean;
}

export const useActivityHistory = (): ActivityHistory => {
  const { activity } = useLiveData();
  const { data, isLoading, isError } = useQuery({ queryKey: ['activity'], queryFn: fetchActivity });
  const [points, setPoints] = useState<ActivityPoint[]>([]);

  const buckets = data?.buckets;
  // Merged rather than only used when the series is still empty. A live value can arrive before this snapshot
  // resolves - which is what happens on sign-in, where the provider and its socket are already running while the
  // dashboard is still mounting - and skipping the snapshot then threw the whole history away, leaving the one
  // live point. Applying the live points over the snapshot keeps both, whichever lands first.
  useEffect(() => {
    if (!buckets) return;
    const snapshot = buckets.map((bucket) => ({ time: bucket.time, minutes: bucket.activity }));
    setPoints((current) => current.reduce(withPoint, snapshot));
  }, [buckets]);

  // Runs for the seeded value too, which is harmless: that bucket is already in the series and replacing it
  // with itself changes nothing.
  useEffect(() => {
    if (!activity) return;
    setPoints((current) => withPoint(current, activity));
  }, [activity]);

  return { points, isLoading, isError };
};
