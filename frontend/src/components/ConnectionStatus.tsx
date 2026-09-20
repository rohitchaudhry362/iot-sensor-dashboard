import { useLiveData } from '../context/LiveDataContext';
import type { ConnectionStatus as Status } from '../realtime/socket';
import { CircleRounded } from '../icons';
import { colors } from '../theme';
import { Chip } from './common';

interface Appearance {
  // Short enough to sit in the app bar next to the account details on a phone.
  label: string;
  // The full sentence, read out by screen readers and shown on hover. It describes the feed rather than the
  // devices: when this says nothing is arriving, the sensors are usually fine and it is our connection to
  // them that is down, which is not a distinction worth getting wrong on a home security dashboard.
  description: string;
  dot: string;
  background: string;
  text: string;
}

const APPEARANCE: Record<Status, Appearance> = {
  connected: {
    label: 'Sensors live',
    description: 'Sensors are sending live updates',
    dot: colors.success.main,
    background: colors.success.light,
    text: colors.success.dark,
  },
  connecting: {
    label: 'Connecting',
    description: 'Connecting to live sensor updates',
    dot: colors.warning.main,
    background: colors.warning.light,
    text: colors.warning.dark,
  },
  offline: {
    label: 'Sensors offline',
    description: 'Not receiving live sensor updates',
    dot: colors.error.main,
    background: colors.error.light,
    text: colors.error.dark,
  },
};

export const ConnectionStatus = () => {
  const { status } = useLiveData();
  const { label, description, dot, background, text } = APPEARANCE[status];

  return (
    <Chip
      size="small"
      label={label}
      title={description}
      aria-label={description}
      icon={<CircleRounded sx={{ fontSize: 8 }} />}
      sx={{ bgcolor: background, color: text, fontWeight: 500, '& .MuiChip-icon': { color: dot, ml: 1, mr: 0.25 } }}
    />
  );
};
