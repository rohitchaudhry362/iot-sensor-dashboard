import Joi from 'joi';

const HOUR_MS = 60 * 60 * 1000;
const DAY_MS = 24 * HOUR_MS;
const DEFAULT_RANGE_MS = 12 * HOUR_MS;

// A week of 15-minute readings for one metric is 672 rows. Past that the answer is aggregation, not a longer
// list, which is the same limit the activity range uses.
export const MAX_RANGE_DAYS = 7;

export interface SensorParams {
  sensorId: number;
}

export const sensorParamsSchema = Joi.object<SensorParams>({
  sensorId: Joi.number().integer().positive().required().example(1),
});

export interface ReadingRangeQuery {
  from: Date;
  to: Date;
  metricName?: string;
}

export const readingRangeSchema = Joi.object<ReadingRangeQuery>({
  from: Joi.date()
    .iso()
    .default(() => new Date(Date.now() - DEFAULT_RANGE_MS))
    .example('2026-09-19T18:00:00.000Z'),
  to: Joi.date()
    .iso()
    .min(Joi.ref('from'))
    .default(() => new Date())
    .example('2026-09-20T06:00:00.000Z'),
  metricName: Joi.string()
    .pattern(/^\w{1,50}$/)
    .default('temperature')
    .example('temperature'),
})
  .custom((value: ReadingRangeQuery, helpers) =>
    value.to.getTime() - value.from.getTime() > MAX_RANGE_DAYS * DAY_MS ? helpers.error('any.invalid') : value,
  )
  .example({ from: '2026-09-19T18:00:00.000Z', to: '2026-09-20T06:00:00.000Z', metricName: 'temperature' });
