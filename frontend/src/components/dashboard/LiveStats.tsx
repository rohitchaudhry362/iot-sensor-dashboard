import { useLiveData } from '../../context/LiveDataContext';
import { useNow } from '../../hooks/useNow';
import { DirectionsRunRounded, DoorFrontRounded, ThermostatRounded, WaterDropRounded } from '../../icons';
import { colors } from '../../theme';
import { describeActivity, describeHumidity, describeTemperature } from '../../util/readingDescriptions';
import { ACTIVITY_STALE_AFTER_MS, formatExactTime, formatRelativeTime, isStale } from '../../util/time';
import { Alert, Box, ProgressBar, Stack } from '../common';
import { StatCard, type CardTiming, type StatCardProps } from './StatCard';

const ACTIVITY_BUCKET_MINUTES = 15;

type StatCardEntry = Omit<StatCardProps, 'isLoading'> & { key: string };

const scheduledTiming = (occurredAt: string, now: number, staleAfterMs?: number): CardTiming => ({
  text: formatRelativeTime(occurredAt, now),
  tooltip: formatExactTime(occurredAt, now),
  isStale: isStale(occurredAt, now, staleAfterMs),
});

export const LiveStats = () => {
  const { temperature, humidity, door, activity, isLoading, isError } = useLiveData();
  const now = useNow();

  const cards: StatCardEntry[] = [
    {
      key: 'door',
      location: door?.location ?? 'Front door',
      title: 'Last movement',
      icon: <DoorFrontRounded />,
      iconBackgroundColor: colors.brand[500],
      headline: door ? formatRelativeTime(door.occurredAt, now) : 'No movement yet',
      timing: door
        ? {
            text: formatExactTime(door.occurredAt, now),
            tooltip: formatExactTime(door.occurredAt, now),
            isStale: false,
          }
        : undefined,
    },
    {
      key: 'temperature',
      location: temperature?.location ?? 'Bathroom',
      title: 'Temperature',
      icon: <ThermostatRounded />,
      iconBackgroundColor: colors.accent.purple,
      headline: temperature ? `${temperature.value}°${temperature.unit}` : '--',
      interpretation: temperature ? describeTemperature(temperature.value) : undefined,
      timing: temperature ? scheduledTiming(temperature.occurredAt, now) : undefined,
    },
    {
      key: 'humidity',
      location: humidity?.location ?? 'Bathroom',
      title: 'Humidity',
      icon: <WaterDropRounded />,
      iconBackgroundColor: colors.secondary[500],
      // No degree sign: the unit is already "%".
      headline: humidity ? `${humidity.value}${humidity.unit}` : '--',
      interpretation: humidity ? describeHumidity(humidity.value) : undefined,
      timing: humidity ? scheduledTiming(humidity.occurredAt, now) : undefined,
    },
    {
      key: 'activity',
      location: 'Whole home',
      title: 'Movement',
      icon: <DirectionsRunRounded />,
      iconBackgroundColor: colors.brand[700],
      headline: activity ? `${activity.minutes} of ${ACTIVITY_BUCKET_MINUTES} min` : '--',
      interpretation: activity ? describeActivity(activity.minutes) : undefined,
      timing: activity ? scheduledTiming(activity.time, now, ACTIVITY_STALE_AFTER_MS) : undefined,
      children: activity ? (
        <ProgressBar
          percent={(activity.minutes / ACTIVITY_BUCKET_MINUTES) * 100}
          color={colors.brand[500]}
          label={`${activity.minutes} of ${ACTIVITY_BUCKET_MINUTES} minutes with movement`}
        />
      ) : null,
    },
  ];

  return (
    <Stack spacing={2}>
      {isError && <Alert severity="error">We could not load your sensors. Please try again shortly.</Alert>}

      <Box
        sx={{
          display: 'grid',
          gap: 2,
          gridTemplateColumns: {
            xs: '1fr',
            sm: 'repeat(2, minmax(0, 1fr))',
            lg: 'repeat(4, minmax(0, 1fr))',
          },
        }}
      >
        {cards.map(({ key, ...card }) => (
          <StatCard key={key} {...card} isLoading={isLoading} />
        ))}
      </Box>
    </Stack>
  );
};
