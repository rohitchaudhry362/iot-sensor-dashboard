import { Link, Stack, Typography } from '../components/common';

export const NotFoundPage = () => (
  <Stack spacing={2} sx={{ alignItems: 'flex-start', py: 8 }}>
    <Typography variant="overline" color="primary">
      404
    </Typography>
    <Typography variant="h3" component="h1">
      Page not found
    </Typography>
    <Typography color="text.secondary">The page you're looking for doesn't exist.</Typography>
    <Link to="/">Back to the dashboard</Link>
  </Stack>
);
