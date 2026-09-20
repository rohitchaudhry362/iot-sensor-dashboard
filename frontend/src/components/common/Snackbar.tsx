import MuiSnackbar, { type SnackbarProps as MuiSnackbarProps } from '@mui/material/Snackbar';
import { layout } from '../../theme';

export type SnackbarProps = MuiSnackbarProps;

export const Snackbar = (props: SnackbarProps) => (
  <MuiSnackbar sx={{ mb: 1, mr: 1, maxWidth: layout.authFormMaxWidth }} {...props} />
);
