import { useEffect, useRef, useState } from 'react';
import { useLiveData } from '../../context/LiveDataContext';
import { Snackbar } from '../common';

const VISIBLE_MS = 1000;

interface Toast {
  // A fresh id per update remounts the Snackbar, which restarts its timer. Without it a second update
  // arriving while the first is showing would inherit the remainder of the old countdown.
  id: number;
  message: string;
}

// A brief note in the corner whenever a reading actually changes, so the page visibly proves it is live
// rather than asking anyone to take it on trust.
export const LiveUpdateToast = () => {
  const { temperature, humidity, door, activity } = useLiveData();
  const [toast, setToast] = useState<Toast | null>(null);

  // The instant each value was measured. Comparing these rather than the objects matters: the context
  // rebuilds its value object on every provider render, so the objects change identity when nothing has
  // actually been measured.
  const temperatureAt = temperature?.occurredAt;
  const humidityAt = humidity?.occurredAt;
  const doorAt = door?.occurredAt;
  const activityAt = activity?.time;

  const announced = useRef<Record<string, string | undefined>>({});

  useEffect(() => {
    const updates: { key: string; at: string | undefined; message: string }[] = [
      { key: 'temperature', at: temperatureAt, message: `Temperature ${temperature?.value}°${temperature?.unit}` },
      { key: 'humidity', at: humidityAt, message: `Humidity ${humidity?.value}${humidity?.unit}` },
      { key: 'door', at: doorAt, message: 'Movement at the front door' },
      { key: 'activity', at: activityAt, message: `Movement ${activity?.minutes} min` },
    ];

    const changed: string[] = [];
    updates.forEach(({ key, at, message }) => {
      if (at === undefined) return;
      const previous = announced.current[key];
      announced.current[key] = at;
      // A feed's first value is whatever the snapshot loaded, which is not news. Recording it without
      // announcing also means the four feeds can finish loading at different moments without each one
      // firing a toast on arrival.
      if (previous !== undefined && previous !== at) changed.push(message);
    });

    // The bathroom sensor reports temperature and humidity in the same breath, so they are announced
    // together rather than as two toasts that would replace one another.
    if (changed.length > 0) setToast({ id: Date.now(), message: changed.join(' · ') });
  }, [temperatureAt, humidityAt, doorAt, activityAt, temperature, humidity, activity]);

  return (
    <Snackbar
      key={toast?.id}
      open={toast !== null}
      autoHideDuration={VISIBLE_MS}
      onClose={() => setToast(null)}
      message={toast?.message}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
    />
  );
};
