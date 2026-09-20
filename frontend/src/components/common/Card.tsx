import MuiCard, { type CardProps as MuiCardProps } from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import { space } from '../../theme';

export type CardProps = MuiCardProps & {
  // `compact` is for dense tiles that sit several to a row, where the usual card padding dominates the tile.
  padding?: 'compact' | 'small' | 'medium';
};

const PADDING = {
  compact: space.text,
  small: space.cardSmall,
  medium: { xs: space.cardSmall, sm: space.cardMedium },
} as const;

export const Card = ({ padding = 'medium', children, ...props }: CardProps) => (
  <MuiCard {...props}>
    <CardContent sx={{ p: PADDING[padding], '&:last-child': { pb: PADDING[padding] } }}>{children}</CardContent>
  </MuiCard>
);
