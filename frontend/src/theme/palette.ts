import type { PaletteOptions } from '@mui/material/styles';
import { colors } from './colors';

export const palette: PaletteOptions = {
  mode: 'light',
  primary: {
    light: colors.brand[300],
    main: colors.brand[500],
    dark: colors.brand[700],
    contrastText: colors.white,
  },
  secondary: {
    light: colors.secondary[200],
    main: colors.secondary[500],
    contrastText: colors.neutral.darker,
  },
  success: { ...colors.success, contrastText: colors.white },
  error: { ...colors.error, contrastText: colors.white },
  warning: { ...colors.warning, contrastText: colors.neutral.darker },
  background: {
    default: colors.beige,
    paper: colors.white,
  },
  text: {
    primary: colors.charcoal,
    secondary: colors.textSecondary,
  },
  divider: colors.border,
};
