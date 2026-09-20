import { Box, Stack, Typography } from '../components/common';
import { ActivityChart } from '../components/dashboard/ActivityChart';
import { LiveStats } from '../components/dashboard/LiveStats';
import { LiveUpdateToast } from '../components/dashboard/LiveUpdateToast';
import { useAuth } from '../context/AuthContext';

export const DashboardPage = () => {
  const { state: authState } = useAuth();

  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant="h3" component="h1">
          Hello, {authState.user?.firstName}
        </Typography>
        <Typography color="text.secondary">Here is what your home is doing right now.</Typography>
      </Box>

      <LiveStats />
      <ActivityChart />
      <LiveUpdateToast />
    </Stack>
  );
};
