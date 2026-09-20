import MuiLinearProgress from '@mui/material/LinearProgress';
import { radius } from '../../theme';

export interface ProgressBarProps {
  // 0 to 100.
  percent: number;
  color: string;
  label: string;
}

export const ProgressBar = ({ percent, color, label }: ProgressBarProps) => (
  <MuiLinearProgress
    variant="determinate"
    value={Math.min(100, Math.max(0, percent))}
    aria-label={label}
    sx={{
      height: 6,
      borderRadius: radius.small,
      backgroundColor: 'rgba(0, 0, 0, 0.08)',
      '& .MuiLinearProgress-bar': { backgroundColor: color, borderRadius: radius.small },
    }}
  />
);
