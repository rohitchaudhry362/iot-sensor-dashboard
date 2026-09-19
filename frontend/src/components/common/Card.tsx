import MuiCard, { type CardProps as MuiCardProps } from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import { space } from '../../theme';

export type CardProps = MuiCardProps & {
  padding?: 'small' | 'medium';
};

export const Card = ({ padding = 'medium', children, ...props }: CardProps) => (
  <MuiCard {...props}>
    <CardContent
      sx={{
        p: padding === 'small' ? space.cardSmall : { xs: space.cardSmall, sm: space.cardMedium },
        '&:last-child': { pb: padding === 'small' ? space.cardSmall : { xs: space.cardSmall, sm: space.cardMedium } },
      }}
    >
      {children}
    </CardContent>
  </MuiCard>
);
