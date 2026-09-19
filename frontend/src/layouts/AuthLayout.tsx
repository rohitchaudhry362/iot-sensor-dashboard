import type { ReactNode } from 'react';
import { Box, Logo, Stack, Typography } from '../components/common';
import { CheckCircleRounded } from '../icons';
import { APP_TAGLINE } from '../config/app';
import { colors, layout, radius, space } from '../theme';

const HIGHLIGHTS = [
  'Live temperature, humidity and door activity',
  'Months of history in interactive charts',
  'Spot unusual readings the moment they happen',
];

interface AuthLayoutProps {
  children: ReactNode;
}

export const AuthLayout = ({ children }: AuthLayoutProps) => (
  <Box
    component="main"
    sx={{ minHeight: '100dvh', display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' } }}
  >
    <Box
      sx={{
        display: { xs: 'none', md: 'flex' },
        flexDirection: 'column',
        justifyContent: 'space-between',
        p: space.sectionSmall,
        m: 2,
        borderRadius: `${radius.large}px`,
        backgroundColor: colors.brand[100],
      }}
    >
      <Logo />
      <Stack spacing={space.cardSmall} sx={{ maxWidth: 480 }}>
        <Typography variant="h2" component="p">
          {APP_TAGLINE}
        </Typography>
        <Stack component="ul" spacing={1.5} sx={{ listStyle: 'none', p: 0, m: 0 }}>
          {HIGHLIGHTS.map((text) => (
            <Stack component="li" key={text} direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
              <CheckCircleRounded sx={{ color: colors.brand[500] }} aria-hidden />
              <Typography variant="subtitle1">{text}</Typography>
            </Stack>
          ))}
        </Stack>
      </Stack>
      <Typography variant="body2" color="text.secondary">
        Sensor data from your home network, streamed in real time.
      </Typography>
    </Box>

    <Box sx={{ display: 'grid', placeItems: 'center', px: layout.pagePaddingX, py: space.sectionSmall }}>
      <Stack spacing={space.cardSmall} sx={{ width: '100%', maxWidth: layout.authFormMaxWidth }}>
        <Box sx={{ display: { md: 'none' } }}>
          <Logo />
        </Box>
        {children}
      </Stack>
    </Box>
  </Box>
);
