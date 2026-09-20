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
  useEffect(() => {
    if (!buckets) return;
    setPoints((current) =>
      current.length > 0 ? current : buckets.map((bucket) => ({ time: bucket.time, minutes: bucket.activity })),
    );
  }, [buckets]);

  // Runs for the seeded value too, which is harmless: that bucket is already in the series and replacing it
  // with itself changes nothing.
  useEffect(() => {
    if (!activity) return;
    setPoints((current) => withPoint(current, activity));
  }, [activity]);

  return { points, isLoading, isError };
};
