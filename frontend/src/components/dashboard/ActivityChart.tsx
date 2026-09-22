import { Area, AreaChart, CartesianGrid, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { ACTIVITY_WINDOW_HOURS } from '../../api/dashboard';
import { useActivityHistory } from '../../hooks/useActivityHistory';
import { colors, fontFamily } from '../../theme';
import { clockTime, roundTicks } from '../../util/chartAxis';
import { Alert, Box, Card, Skeleton, Stack, Typography } from '../common';

const BUCKET_MINUTES = 15;
const CHART_HEIGHT = 220;
const VALUE_LABEL_OFFSET = 8;
const VALUE_LABEL_FONT_SIZE = 10;
const CHART_MARGIN = { top: VALUE_LABEL_OFFSET + VALUE_LABEL_FONT_SIZE + 4, right: 16, bottom: 0, left: -24 };

export const ActivityChart = () => {
  const { points: history, isLoading, isError } = useActivityHistory();

  // A real time axis, not a list of labels: the distance between two points is the time between them, so a
  // gap in the feed shows as a gap rather than being silently closed up.
  const points = history.map((point) => ({ timestamp: new Date(point.time).getTime(), minutes: point.minutes }));
  const from = points[0]?.timestamp ?? 0;
  const to = points[points.length - 1]?.timestamp ?? 0;

  return (
    <Card padding="small">
      <Stack spacing={2}>
        <Box>
          <Typography variant="h6" component="h2">
            Movement through the day
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Minutes with movement in each 15-minute period, over the last {ACTIVITY_WINDOW_HOURS} hours
          </Typography>
        </Box>

        {isError && <Alert severity="error">We could not load the activity history.</Alert>}

        {isLoading ? (
          <Skeleton variant="rounded" height={CHART_HEIGHT} />
        ) : points.length === 0 ? (
          <Box sx={{ height: CHART_HEIGHT, display: 'grid', placeItems: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              No movement recorded yet. The chart fills in as readings arrive.
            </Typography>
          </Box>
        ) : (
          <Box sx={{ height: CHART_HEIGHT }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={points} margin={CHART_MARGIN}>
                <linearGradient id="activityFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={colors.brand[500]} stopOpacity={0.35} />
                  <stop offset="100%" stopColor={colors.brand[500]} stopOpacity={0.02} />
                </linearGradient>
                <CartesianGrid stroke={colors.border} vertical={false} />
                <XAxis
                  dataKey="timestamp"
                  type="number"
                  scale="time"
                  domain={[from, to]}
                  ticks={roundTicks(from, to)}
                  tickFormatter={clockTime}
                  tickLine={false}
                  axisLine={{ stroke: colors.border }}
                  tick={{ fill: colors.neutral.base, fontSize: 12, fontFamily }}
                />
                <YAxis
                  domain={[0, BUCKET_MINUTES]}
                  ticks={[0, 5, 10, BUCKET_MINUTES]}
                  tickLine={false}
                  axisLine={false}
                  width={48}
                  tick={{ fill: colors.neutral.base, fontSize: 12, fontFamily }}
                />
                <Tooltip
                  labelFormatter={(label: unknown) => (typeof label === 'number' ? `${clockTime(label)} onwards` : '')}
                  formatter={(value: unknown): [string, string] => [
                    `${typeof value === 'number' ? value : 0} of ${BUCKET_MINUTES} min`,
                    'Movement',
                  ]}
                  contentStyle={{
                    fontFamily,
                    fontSize: 13,
                    borderRadius: 8,
                    border: `1px solid ${colors.border}`,
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="minutes"
                  stroke={colors.brand[500]}
                  strokeWidth={2}
                  fill="url(#activityFill)"
                  // Every bucket gets a dot and its own number, so a value can be read without hovering.
                  dot={{ r: 2, fill: colors.brand[500], strokeWidth: 0 }}
                  // A new point every 15 minutes would otherwise redraw the whole area each time.
                  isAnimationActive={false}
                >
                  <LabelList
                    dataKey="minutes"
                    position="top"
                    offset={VALUE_LABEL_OFFSET}
                    formatter={(value: unknown) => (typeof value === 'number' ? value.toFixed(1) : '')}
                    style={{ fill: colors.neutral.base, fontSize: VALUE_LABEL_FONT_SIZE, fontFamily }}
                  />
                </Area>
              </AreaChart>
            </ResponsiveContainer>
          </Box>
        )}
      </Stack>
    </Card>
  );
};
