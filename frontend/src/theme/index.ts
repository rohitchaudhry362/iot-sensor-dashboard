import { createTheme } from '@mui/material/styles';
import { breakpoints } from './breakpoints';
import { components } from './components';
import { palette } from './palette';
import { radius } from './shape';
import { SPACING_UNIT } from './spacing';
import { typography } from './typography';

export const theme = createTheme({
  breakpoints: { values: breakpoints },
  palette,
  typography,
  spacing: SPACING_UNIT,
  shape: { borderRadius: radius.small },
  components,
});

export { breakpoints } from './breakpoints';
export { colors } from './colors';
export { borderWidth, elevation, focusRing, radius } from './shape';
export { layout, space, SPACING_UNIT } from './spacing';
export { fontFamily, fontWeight } from './typography';
