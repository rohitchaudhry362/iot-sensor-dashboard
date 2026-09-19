import { Card, Stack, Typography } from '../components/common';
import { useAuth } from '../features/auth/AuthContext';

// Placeholder until the live dashboard is built.
export const DashboardPage = () => {
  const { state } = useAuth();

  return (
    <Stack spacing={3}>
      <Typography variant="h3" component="h1">
        Hello, {state.user?.firstName}
      </Typography>
      <Card>
        <Typography color="text.secondary">
          Your live sensor dashboard will appear here: temperature, humidity and front door activity.
        </Typography>
      </Card>
    </Stack>
  );
};
