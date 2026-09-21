import { Box, Stack, Typography } from '../components/common';
import { ActivityChart } from '../components/dashboard/ActivityChart';
import { DeviceList } from '../components/dashboard/DeviceList';
import { DeviceStatus } from '../components/dashboard/DeviceStatus';
import { LiveStats } from '../components/dashboard/LiveStats';
import { LiveUpdateToast } from '../components/dashboard/LiveUpdateToast';
import { SensorHistoryChart } from '../components/dashboard/SensorHistoryChart';
import { useAuth } from '../context/AuthContext';

export const DashboardPage = () => {
  const { state: authState } = useAuth();

  return (
    <Stack spacing={3}>
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          gap: 2,
          alignItems: { sm: 'center' },
          justifyContent: 'space-between',
        }}
      >
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="h3" component="h1">
            Hello, {authState.user?.firstName}
          </Typography>
          <Typography color="text.secondary">Here is what your home is doing right now.</Typography>
        </Box>
        <DeviceStatus />
      </Box>

      <DeviceList />
      <LiveStats />
      <ActivityChart />
      <SensorHistoryChart />
      <LiveUpdateToast />
    </Stack>
  );
};
