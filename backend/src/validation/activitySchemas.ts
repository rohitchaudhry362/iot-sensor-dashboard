import Joi from 'joi';

export interface ActivityRangeQuery {
  from: Date;
  to: Date;
}

const HOUR_MS = 60 * 60 * 1000;
const DAY_MS = 24 * HOUR_MS;

const DEFAULT_RANGE_MS = DAY_MS;

// A week of raw buckets is 672 rows. Past that the answer is to aggregate (Phase 4 adds `bucket=1h|1d`)
// rather than to send tens of thousands of rows to a browser.
export const MAX_RANGE_DAYS = 7;

// Query for GET /api/activity. Both ends are optional and default to the last 24 hours. The range is
// half-open, [from, to), so consecutive windows do not repeat the bucket on their shared boundary.
export const activityRangeSchema = Joi.object<ActivityRangeQuery>({
  from: Joi.date()
    .iso()
    .default(() => new Date(Date.now() - DEFAULT_RANGE_MS))
    .example('2026-09-19T00:00:00.000Z'),
  to: Joi.date()
    .iso()
    .min(Joi.ref('from'))
    .default(() => new Date())
    .example('2026-09-20T00:00:00.000Z'),
})
  .custom((value: ActivityRangeQuery, helpers) =>
    value.to.getTime() - value.from.getTime() > MAX_RANGE_DAYS * DAY_MS ? helpers.error('any.invalid') : value,
  )
  .example({ from: '2026-09-19T00:00:00.000Z', to: '2026-09-20T00:00:00.000Z' });
