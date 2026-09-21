import { useLiveData } from '../../context/LiveDataContext';
import { useNow } from '../../hooks/useNow';
import type { NetworkStatus } from '../../realtime/events';
import { colors, radius } from '../../theme';
import { formatExactTime, formatRelativeTime } from '../../util/time';
import { Box, Stack, Typography } from '../common';

interface StatusDisplay {
  label: string;
  dotColor: string;
  background: string;
}

const STATUS_DISPLAY: Record<NetworkStatus, StatusDisplay> = {
  online: { label: 'Devices live', dotColor: colors.success.main, background: colors.success.light },
  offline: { label: 'Devices offline', dotColor: colors.error.main, background: colors.error.light },
};

const PENDING_DISPLAY: StatusDisplay = {
  label: 'Checking devices',
  dotColor: colors.neutral.light,
  background: colors.neutral.lightest,
};

export const DeviceStatus = () => {
  const { networkStatus } = useLiveData();
  const now = useNow();

  const display = networkStatus ? STATUS_DISPLAY[networkStatus.status] : PENDING_DISPLAY;
  const since = networkStatus?.status === 'offline' ? formatRelativeTime(networkStatus.changedAt, now) : null;

  return (
    <Stack
      direction="row"
      spacing={1}
      sx={{
        alignItems: 'center',
        alignSelf: 'flex-start',
        px: 1.5,
        py: 0.75,
        borderRadius: `${radius.small}px`,
        bgcolor: display.background,
      }}
      title={networkStatus ? formatExactTime(networkStatus.changedAt, now) : undefined}
    >
      <Box sx={{ width: 8, height: 8, borderRadius: '50%', flexShrink: 0, bgcolor: display.dotColor }} />
      <Typography variant="caption" sx={{ fontWeight: 600, color: colors.charcoal }}>
        {display.label}
        {since && ` · ${since}`}
      </Typography>
    </Stack>
  );
};
