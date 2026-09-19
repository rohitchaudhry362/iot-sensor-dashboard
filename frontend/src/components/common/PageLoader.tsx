import CircularProgress from '@mui/material/CircularProgress';
import { Box } from './Box';

export const PageLoader = ({ label = 'Loading' }: { label?: string }) => (
  <Box sx={{ minHeight: '100dvh', display: 'grid', placeItems: 'center' }}>
    <CircularProgress aria-label={label} />
  </Box>
);
