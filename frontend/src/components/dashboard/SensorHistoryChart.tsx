import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ReferenceArea,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { fetchSensorReadings, fetchSensors } from '../../api/dashboard';
import { colors, fontFamily } from '../../theme';
import { clockTime, roundTicks, toLocalInputValue } from '../../util/chartAxis';
import { bandFor, HUMIDITY_BANDS, TEMPERATURE_BANDS, type Band, type BandLevel } from '../../util/readingDescriptions';
import { Alert, Box, Card, DateTimeField, Select, Skeleton, Stack, Typography } from '../common';

const HOUR_MS = 60 * 60 * 1000;
const WINDOW_HOURS = 12;
const CHART_HEIGHT = 260;
const BAR_WIDTH = 8;

const LEVEL_COLOR: Record<BandLevel, string> = {
  low: colors.secondary[500],
  slightlyLow: colors.secondary[200],
  ideal: colors.success.main,
  slightlyHigh: colors.warning.main,
  high: colors.error.main,
};

interface MetricChoice {
  label: string;
  bands: Band[];
  domain: [number, number];
  story: string;
}

const METRICS: Record<string, MetricChoice> = {
  temperature: {
    label: 'Temperature',
    bands: TEMPERATURE_BANDS,
    domain: [10, 32],
    story: 'Each bar is a 15-minute period, coloured by how comfortable it was.',
  },
  humidity: {
    label: 'Humidity',
    bands: HUMIDITY_BANDS,
    domain: [0, 100],
    story: 'Each bar is a 15-minute period. Tall red bars are usually a shower.',
  },
};

const SLOT_MS = 15 * 60 * 1000;

interface Slot {
  timestamp: number;
  value: number;
  unit: string;
  readingCount: number;
}

// Readings arrive roughly every 15 minutes but never exactly: the sample data drifts by whole minutes, and a
// backfilled stretch meets live data at an arbitrary offset. That matters more than it sounds, because
// Recharts sizes bars from the *smallest* gap between adjacent points on a time axis - so a single close pair
// anywhere in the window makes every bar hairline. Snapping to the reporting cadence makes the spacing
// uniform, which lets the bars size themselves properly at any screen width, and is also what a bar chart
// claims to be showing: one bar, one period.
const toSlots = (readings: { value: number; unit: string; occurredAt: string }[]): Slot[] => {
  const totals = new Map<number, { sum: number; count: number; unit: string }>();
  readings.forEach((reading) => {
    const slot = Math.floor(new Date(reading.occurredAt).getTime() / SLOT_MS) * SLOT_MS;
    const running = totals.get(slot);
    totals.set(slot, {
      sum: (running?.sum ?? 0) + reading.value,
      count: (running?.count ?? 0) + 1,
      unit: reading.unit,
    });
  });

  return [...totals.entries()]
    .map(([timestamp, { sum, count, unit }]) => ({
      timestamp,
      // Rounded to one decimal, matching the precision the devices report at.
      value: Math.round((sum / count) * 10) / 10,
      unit,
      readingCount: count,
    }))
    .sort((earlier, later) => earlier.timestamp - later.timestamp);
};

interface SeriesChoice {
  value: string;
  label: string;
  sensorId: number;
  metricName: string;
}

export const SensorHistoryChart = () => {
  const [selectedMetric, setSelectedMetric] = useState<string | null>(null);
  const [endsAt, setEndsAt] = useState(() => toLocalInputValue(new Date()));

  // The device list says what each sensor measures, so which sensor owns a metric is read rather than
  // guessed. It is fetched once when the app loads and shared from cache with the device panel.
  const sensorsQuery = useQuery({ queryKey: ['sensors'], queryFn: fetchSensors });

  const choices: SeriesChoice[] = (sensorsQuery.data?.sensors ?? []).flatMap((sensor) =>
    sensor.metrics
      .filter((sensorMetric) => sensorMetric.name in METRICS)
      .map((sensorMetric) => ({
        value: `${sensor.id}:${sensorMetric.name}`,
        label: `${sensor.location} · ${METRICS[sensorMetric.name].label}`,
        sensorId: sensor.id,
        metricName: sensorMetric.name,
      })),
  );

  // Temperature opens by default when a device reports it; otherwise whatever there is.
  const fallback = choices.find((choice) => choice.metricName === 'temperature') ?? choices[0];
  const series = choices.find((choice) => choice.value === selectedMetric) ?? fallback;
  const metric = series ? METRICS[series.metricName] : METRICS.temperature;

  const parsedEnd = new Date(endsAt);
  const isWindowValid = !Number.isNaN(parsedEnd.getTime());
  const to = isWindowValid ? parsedEnd : new Date();
  const from = new Date(to.getTime() - WINDOW_HOURS * HOUR_MS);

  const readingsQuery = useQuery({
    queryKey: ['sensor-readings', series?.sensorId, series?.metricName, from.toISOString(), to.toISOString()],
    queryFn: () =>
      fetchSensorReadings({
        sensorId: series?.sensorId as number,
        metricName: series?.metricName as string,
        from,
        to,
      }),
    enabled: series !== undefined && isWindowValid,
  });

  const bars = toSlots(readingsQuery.data?.readings ?? []).map((slot) => {
    const band = bandFor(metric.bands, slot.value);
    return { ...slot, band: band.label, color: LEVEL_COLOR[band.level] };
  });

  const isLoading = sensorsQuery.isLoading || readingsQuery.isLoading;
  const isError = sensorsQuery.isError || readingsQuery.isError;

  // The shaded band behind the bars. A band carries only its upper bound, so the ideal range starts where the
  // band below it ends - or at the bottom of the axis when nothing sits below it.
  const idealBandIndex = metric.bands.findIndex((band) => band.level === 'ideal');
  const idealRangeMin = metric.bands[idealBandIndex - 1]?.upTo ?? metric.domain[0];
  const idealRangeMax: number | undefined = metric.bands[idealBandIndex]?.upTo;

  return (
    <Card padding="small">
      <Stack spacing={2}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            gap: 2,
            alignItems: { md: 'flex-end' },
            justifyContent: 'space-between',
          }}
        >
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="h6" component="h2">
              {metric.label} history
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {metric.story}
            </Typography>
          </Box>
          <Box
            sx={{
              display: 'grid',
              gap: 2,
              gridTemplateColumns: { xs: '1fr', sm: 'minmax(0, 1fr) minmax(0, 1.25fr)', md: 'auto auto' },
              width: { xs: '100%', md: 'auto' },
              flexShrink: 0,
            }}
          >
            <Select label="Reading" value={series?.value ?? ''} options={choices} onChange={setSelectedMetric} />
            <DateTimeField
              label={`${WINDOW_HOURS} hours ending`}
              value={endsAt}
              max={toLocalInputValue(new Date())}
              onChange={setEndsAt}
            />
          </Box>
        </Box>

        {isError && <Alert severity="error">We could not load that history. Try a different window.</Alert>}

        {isLoading ? (
          <Skeleton variant="rounded" height={CHART_HEIGHT} />
        ) : bars.length === 0 ? (
          <Box sx={{ height: CHART_HEIGHT, display: 'grid', placeItems: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              No readings in this window.
            </Typography>
          </Box>
        ) : (
          <Box sx={{ height: CHART_HEIGHT }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={bars} margin={{ top: 4, right: 8, bottom: 0, left: -20 }}>
                <CartesianGrid stroke={colors.border} vertical={false} />
                {idealRangeMax !== undefined && (
                  <ReferenceArea
                    y1={idealRangeMin}
                    y2={idealRangeMax}
                    fill={colors.success.main}
                    fillOpacity={0.06}
                    ifOverflow="hidden"
                  />
                )}
                <XAxis
                  dataKey="timestamp"
                  type="number"
                  scale="time"
                  domain={[from.getTime(), to.getTime()]}
                  ticks={roundTicks(from.getTime(), to.getTime())}
                  tickFormatter={clockTime}
                  tickLine={false}
                  axisLine={{ stroke: colors.border }}
                  tick={{ fill: colors.neutral.base, fontSize: 12, fontFamily }}
                />
                <YAxis
                  domain={metric.domain}
                  tickLine={false}
                  axisLine={false}
                  width={44}
                  tick={{ fill: colors.neutral.base, fontSize: 12, fontFamily }}
                />
                <Tooltip
                  cursor={{ fill: colors.brand[100], fillOpacity: 0.4 }}
                  labelFormatter={(label: unknown) => (typeof label === 'number' ? clockTime(label) : '')}
                  formatter={(value: unknown, _name: unknown, item: unknown): [string, string] => {
                    const point = (item as { payload?: (typeof bars)[number] }).payload;
                    const count = point?.readingCount ?? 1;
                    const label = count > 1 ? `${point?.band ?? ''} (mean of ${count})` : (point?.band ?? metric.label);
                    return [`${typeof value === 'number' ? value : 0}${point?.unit ?? ''}`, label];
                  }}
                  contentStyle={{ fontFamily, fontSize: 13, borderRadius: 8, border: `1px solid ${colors.border}` }}
                />
                <Bar dataKey="value" isAnimationActive={false} radius={[2, 2, 0, 0]} maxBarSize={BAR_WIDTH}>
                  {bars.map((bar) => (
                    <Cell key={bar.timestamp} fill={bar.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Box>
        )}

        <Stack direction="row" spacing={2} sx={{ flexWrap: 'wrap', gap: 1 }}>
          {metric.bands.map((band) => (
            <Stack key={band.label} direction="row" spacing={0.75} sx={{ alignItems: 'center' }}>
              <Box sx={{ width: 10, height: 10, borderRadius: '2px', bgcolor: LEVEL_COLOR[band.level] }} />
              <Typography variant="caption" color="text.secondary">
                {band.label}
              </Typography>
            </Stack>
          ))}
        </Stack>
      </Stack>
    </Card>
  );
};
