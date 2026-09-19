import Joi from 'joi'

export interface MetricReading {
  name: string
  unit: string
  value: number
}

export interface SensorEventRow {
  networkId: number
  thingName: string
  locationName: string
  action: string
  reading: MetricReading | null
  occurredAt: Date
}

export interface ActivityRow {
  networkId: number
  time: Date
  activity: number
}

const rawSensorSchema = Joi.object({
  network_id: Joi.number().integer().required(),
  locationName: Joi.string().max(100).required(),
  action: Joi.string().max(50).valid('SensorValueChanged', 'SensorDetected').required(),
  payload: Joi.string().required(),
  thingName: Joi.string().max(64).required(),
  date: Joi.date().iso().required(),
})

const rawActivitySchema = Joi.object({
  network_id: Joi.number().integer().required(),
  time: Joi.date().iso().required(),
  activity: Joi.number().required(),
})

const unitSchema = Joi.string().max(10).required()
const valueSchema = Joi.number().required()
const metricNameSchema = Joi.string().max(50)

// A payload is either empty (event-only sensors) or one metric plus its unit,
// e.g. {"unit": "C", "temperature": 24.4}.
const parseReading = (rawPayload: string): MetricReading | null => {
  const payload: unknown = JSON.parse(rawPayload)
  if (payload === null || typeof payload !== 'object' || Array.isArray(payload)) {
    throw new Error('payload must be a JSON object')
  }

  const { unit, ...metrics } = payload as Record<string, unknown>
  const names = Object.keys(metrics)

  if (names.length === 0 && unit === undefined) return null
  if (names.length !== 1) throw new Error('payload must contain exactly one metric')

  const name = Joi.attempt(names[0], metricNameSchema)
  return {
    name,
    unit: Joi.attempt(unit, unitSchema) as string,
    value: Joi.attempt(metrics[name], valueSchema) as number,
  }
}

export const parseSensorEvent = (raw: unknown): SensorEventRow => {
  const value = Joi.attempt(raw, rawSensorSchema, { allowUnknown: false }) as {
    network_id: number
    locationName: string
    action: string
    payload: string
    thingName: string
    date: Date
  }
  return {
    networkId: value.network_id,
    thingName: value.thingName,
    locationName: value.locationName,
    action: value.action,
    reading: parseReading(value.payload),
    occurredAt: value.date,
  }
}

export const parseActivity = (raw: unknown): ActivityRow => {
  const value = Joi.attempt(raw, rawActivitySchema) as { network_id: number; time: Date; activity: number }
  return { networkId: value.network_id, time: value.time, activity: value.activity }
}
