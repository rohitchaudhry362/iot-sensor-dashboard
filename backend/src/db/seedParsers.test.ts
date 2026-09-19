import { describe, expect, it } from 'vitest'
import { parseActivity, parseSensorEvent } from './seedParsers'

const baseSensor = {
  network_id: 1,
  locationName: 'Bathroom',
  action: 'SensorValueChanged',
  payload: '{"unit": "C", "temperature": 24.4}',
  thingName: 'SENSOR_7C3E822F6E550000',
  date: '2025-10-01T23:58:01.604Z',
}

describe('parseSensorEvent', () => {
  it('double-parses the JSON string payload into a metric reading', () => {
    const row = parseSensorEvent(baseSensor)
    expect(row.reading).toEqual({ name: 'temperature', unit: 'C', value: 24.4 })
    expect(row.thingName).toBe('SENSOR_7C3E822F6E550000')
    expect(row.occurredAt.toISOString()).toBe('2025-10-01T23:58:01.604Z')
  })

  it('parses humidity readings', () => {
    const row = parseSensorEvent({ ...baseSensor, payload: '{"unit": "%", "humidity": 54}' })
    expect(row.reading).toEqual({ name: 'humidity', unit: '%', value: 54 })
  })

  it('returns no reading for SensorDetected events with an empty payload', () => {
    const row = parseSensorEvent({
      ...baseSensor,
      locationName: 'Front Door',
      action: 'SensorDetected',
      payload: '{}',
      thingName: 'SENSOR_282C02BFFFEEE739',
    })
    expect(row.reading).toBeNull()
  })

  it('rejects unknown actions and malformed payloads', () => {
    expect(() => parseSensorEvent({ ...baseSensor, action: 'Boom' })).toThrow()
    expect(() => parseSensorEvent({ ...baseSensor, payload: 'not json' })).toThrow()
    expect(() => parseSensorEvent({ ...baseSensor, payload: '[1,2]' })).toThrow()
  })

  it('rejects payloads with a missing unit, non-numeric value, or several metrics', () => {
    expect(() => parseSensorEvent({ ...baseSensor, payload: '{"temperature": 24.4}' })).toThrow()
    expect(() => parseSensorEvent({ ...baseSensor, payload: '{"unit": "C", "temperature": "hot"}' })).toThrow()
    expect(() =>
      parseSensorEvent({ ...baseSensor, payload: '{"unit": "C", "temperature": 1, "humidity": 2}' }),
    ).toThrow()
    expect(() => parseSensorEvent({ ...baseSensor, payload: '{"unit": "C"}' })).toThrow()
  })
})

describe('parseActivity', () => {
  it('maps a valid bucket', () => {
    const row = parseActivity({ network_id: 1, time: '2025-10-01T23:45:00.000Z', activity: 3.42 })
    expect(row).toEqual({ networkId: 1, time: new Date('2025-10-01T23:45:00.000Z'), activity: 3.42 })
  })
})
