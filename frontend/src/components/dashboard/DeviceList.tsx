import { useQuery } from '@tanstack/react-query';
import { fetchSensors } from '../../api/dashboard';
import type { Sensor } from '../../api/types';
import { DoorFrontRounded, SensorsRounded } from '../../icons';
import { borderWidth, colors, radius } from '../../theme';
import { range } from '../../util/range';
import { Alert, Box, Card, Skeleton, Stack, Typography } from '../common';

const describeMetrics = (sensor: Sensor): string =>
  sensor.metrics.length === 0
    ? 'Movement detection'
    : sensor.metrics
        .map((metric) => `${metric.name.charAt(0).toUpperCase()}${metric.name.slice(1)} (${metric.unit})`)
        .join(' · ');

export const DeviceList = () => {
  const { data, isLoading, isError } = useQuery({ queryKey: ['sensors'], queryFn: fetchSensors });
  const sensors = data?.sensors ?? [];

  return (
    <Card padding="small">
      <Stack spacing={2}>
        <Box>
          <Typography variant="h6" component="h2">
            Devices
          </Typography>
          <Typography variant="body2" color="text.secondary">
            What is reporting from your home, and what each one measures.
          </Typography>
        </Box>

        {isError && <Alert severity="error">We could not load your devices.</Alert>}

        <Box
          sx={{
            display: 'grid',
            gap: 2,
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))' },
          }}
        >
          {isLoading
            ? range(2).map((placeholder) => <Skeleton key={placeholder} variant="rounded" height={76} />)
            : sensors.map((sensor) => (
                <Stack
                  key={sensor.id}
                  direction="row"
                  spacing={1.5}
                  sx={{
                    alignItems: 'center',
                    p: 2,
                    border: `${borderWidth}px solid ${colors.border}`,
                    borderRadius: `${radius.medium}px`,
                  }}
                >
                  <Box
                    sx={{
                      width: 32,
                      height: 32,
                      borderRadius: '50%',
                      display: 'grid',
                      placeItems: 'center',
                      flexShrink: 0,
                      bgcolor: colors.brand[100],
                      color: colors.brand[700],
                      '& > svg': { fontSize: 18 },
                    }}
                  >
                    {sensor.metrics.length === 0 ? <DoorFrontRounded /> : <SensorsRounded />}
                  </Box>
                  <Box sx={{ minWidth: 0 }}>
                    <Typography sx={{ fontWeight: 600 }}>{sensor.location}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {describeMetrics(sensor)}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" noWrap sx={{ display: 'block' }}>
                      {sensor.name}
                    </Typography>
                  </Box>
                </Stack>
              ))}
        </Box>
      </Stack>
    </Card>
  );
};
