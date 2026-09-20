const MINUTE_MS = 60 * 1000;
const HOUR_MS = 60 * MINUTE_MS;

export const clockTime = (epochMs: number): string =>
  new Date(epochMs).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });

// Ticks land on round clock times rather than on whichever reading happens to be first, and the step widens
// with the span so the labels never collide.
const tickStepMs = (spanMs: number): number => {
  const spanHours = spanMs / HOUR_MS;
  if (spanHours <= 3) return 30 * MINUTE_MS;
  if (spanHours <= 8) return HOUR_MS;
  if (spanHours <= 16) return 2 * HOUR_MS;
  return 3 * HOUR_MS;
};

export const roundTicks = (from: number, to: number): number[] => {
  const step = tickStepMs(to - from);
  const ticks: number[] = [];
  for (let tick = Math.ceil(from / step) * step; tick <= to; tick += step) ticks.push(tick);
  return ticks;
};

// "YYYY-MM-DDTHH:mm" in the viewer's own time zone, which is the format a datetime-local input expects.
// Converting through toISOString alone would silently shift the value by the UTC offset.
export const toLocalInputValue = (date: Date): string =>
  new Date(date.getTime() - date.getTimezoneOffset() * MINUTE_MS).toISOString().slice(0, 16);
