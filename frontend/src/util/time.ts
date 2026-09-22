const MINUTE_MS = 60 * 1000;
const HOUR_MS = 60 * MINUTE_MS;
const DAY_MS = 24 * HOUR_MS;

// The bathroom sensor and the activity feed both report every 15 minutes, so nothing for twice that long
// means the feed has stopped rather than simply been quiet. The front door is deliberately not measured this
// way: a door that has not moved is the normal case, not a fault.
export const STALE_AFTER_MS = 30 * MINUTE_MS;

// Activity needs a wider window. A bucket is named by the moment it *starts* but is only published once its
// fifteen minutes have run, so the newest one on record is always 15 to 30 minutes old by its own label.
// Measuring staleness from the label without allowing for that would flag a healthy feed every cycle.
export const ACTIVITY_STALE_AFTER_MS = 45 * MINUTE_MS;

const relativeTime = new Intl.RelativeTimeFormat(undefined, { numeric: 'auto' });

// "just now", "5 minutes ago", "3 hours ago". `now` is passed in rather than read here so that the value
// changes with a ticking clock and React re-renders it.
export const formatRelativeTime = (isoTime: string, now: number): string => {
  const elapsedMs = now - new Date(isoTime).getTime();
  if (elapsedMs < MINUTE_MS) return 'just now';
  if (elapsedMs < HOUR_MS) return relativeTime.format(-Math.floor(elapsedMs / MINUTE_MS), 'minute');
  if (elapsedMs < DAY_MS) return relativeTime.format(-Math.floor(elapsedMs / HOUR_MS), 'hour');
  return relativeTime.format(-Math.floor(elapsedMs / DAY_MS), 'day');
};

// "Today at 14:32" / "19 Sept at 14:32", so a relative time can always be resolved to a real one.
export const formatExactTime = (isoTime: string, now: number): string => {
  const moment = new Date(isoTime);
  const clock = moment.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
  const isToday = new Date(now).toDateString() === moment.toDateString();
  return isToday
    ? `Today at ${clock}`
    : `${moment.toLocaleDateString(undefined, { day: 'numeric', month: 'short' })} at ${clock}`;
};

export const formatCalendarDate = (isoTime: string): string =>
  new Date(isoTime).toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' });

export const isStale = (isoTime: string, now: number, staleAfterMs: number = STALE_AFTER_MS): boolean =>
  now - new Date(isoTime).getTime() > staleAfterMs;
