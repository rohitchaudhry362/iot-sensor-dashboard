export interface RecurringTaskOptions {
  task: () => void;
  // Asked before every run, so the gap can be fixed, random, or computed from the wall clock.
  nextDelayMs: () => number;
  runImmediately: boolean;
}

// Chained setTimeout rather than setInterval: the next delay is chosen after each run, so a gap that depends on the
// clock (the next quarter-hour) cannot drift, and a random gap is possible. Returns a function that stops it.
export const startRecurringTask = ({ task, nextDelayMs, runImmediately }: RecurringTaskOptions): (() => void) => {
  let nextRunTimer: NodeJS.Timeout | undefined;

  const scheduleNextRun = (): void => {
    nextRunTimer = setTimeout(() => {
      task();
      scheduleNextRun();
    }, nextDelayMs());
  };

  if (runImmediately) task();
  scheduleNextRun();

  return () => clearTimeout(nextRunTimer);
};
