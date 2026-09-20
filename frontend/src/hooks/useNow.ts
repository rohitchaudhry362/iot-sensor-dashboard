import { useEffect, useState } from 'react';

const THIRTY_SECONDS = 30 * 1000;

export const useNow = (intervalMs: number = THIRTY_SECONDS): number => {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), intervalMs);
    return () => clearInterval(timer);
  }, [intervalMs]);

  return now;
};
