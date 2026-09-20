import type { ReactElement } from 'react';
import { Box, Card, Skeleton, Stack, Typography } from '../common';
import { colors } from '../../theme';

export type IconBackgroundColor =
  | (typeof colors.brand)[500]
  | (typeof colors.brand)[700]
  | (typeof colors.accent)['purple']
  | (typeof colors.secondary)[500];

export interface CardTiming {
  // The wording shown in the footer, e.g. "5 minutes ago".
  text: string;
  // Shown on hover, so a relative claim can always be resolved to a real time.
  tooltip: string;
  // True once the feed has missed its reporting window, so the headline is no longer current.
  isStale: boolean;
}

export interface StatCardProps {
  // Where the reading comes from, e.g. "Bathroom". Sits beside the title, not on its own line.
  location: string;
  // What it measures, e.g. "Temperature". Kept short: several of these share a row.
  title: string;
  icon: ReactElement;
  iconBackgroundColor: IconBackgroundColor;
  // The one number or phrase a glance should land on. Always text; anything richer belongs in `children`.
  headline: string;
  // What that number means in plain words, e.g. "Comfortable".
  interpretation?: string;
  // Left out by a card with nothing to time, such as a door that has never reported.
  timing?: CardTiming;
  isLoading?: boolean;
  // An extra element below the headline, such as the activity bar.
  children?: ReactElement | null;
}

export const StatCard = ({
  location,
  title,
  icon,
  iconBackgroundColor,
  headline,
  interpretation,
  timing,
  isLoading = false,
  children,
}: StatCardProps) => {
  const footer = [interpretation, timing && (timing.isStale ? `No update since ${timing.text}` : timing.text)]
    .filter(Boolean)
    .join(' · ');

  return (
    <Card padding="compact" sx={{ height: '100%' }}>
      <Stack spacing={0.75} sx={{ height: '100%' }}>
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center', minWidth: 0 }}>
          <Box
            sx={{
              width: 24,
              height: 24,
              borderRadius: '50%',
              display: 'grid',
              placeItems: 'center',
              backgroundColor: iconBackgroundColor,
              color: colors.white,
              flexShrink: 0,
              '& > svg': { fontSize: 14 },
            }}
          >
            {icon}
          </Box>
          <Typography variant="caption" noWrap sx={{ color: 'text.secondary', fontWeight: 500 }}>
            {title} · {location}
          </Typography>
        </Stack>

        {isLoading ? (
          <Skeleton variant="text" sx={{ fontSize: '1.75rem', maxWidth: 120 }} />
        ) : (
          <Typography component="p" variant="h4" sx={{ lineHeight: 1.2 }}>
            {headline}
          </Typography>
        )}

        {children}

        <Box sx={{ mt: 'auto', minHeight: 17 }}>
          {isLoading ? (
            <Skeleton variant="text" sx={{ maxWidth: 100 }} />
          ) : (
            footer && (
              <Typography
                variant="caption"
                component="p"
                noWrap
                title={timing?.tooltip}
                sx={{ color: timing?.isStale ? colors.warning.dark : 'text.secondary' }}
              >
                {footer}
              </Typography>
            )
          )}
        </Box>
      </Stack>
    </Card>
  );
};
