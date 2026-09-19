import type { TypographyVariantsOptions } from '@mui/material/styles';
import { breakpoints } from './breakpoints';

export const fontFamily = ['Figtree', 'Arial', 'sans-serif'].join(', ');

export const fontWeight = {
  regular: 400,
  medium: 500,
  bold: 700,
} as const;

const desktop = `@media (min-width:${breakpoints.md}px)`;

const heading = (mobileRem: number, desktopRem: number, lineHeight: number) => ({
  fontWeight: fontWeight.bold,
  lineHeight,
  fontSize: `${mobileRem}rem`,
  textWrap: 'balance' as const,
  [desktop]: { fontSize: `${desktopRem}rem` },
});

export const typography: TypographyVariantsOptions = {
  fontFamily,
  fontWeightRegular: fontWeight.regular,
  fontWeightMedium: fontWeight.medium,
  fontWeightBold: fontWeight.bold,
  h1: heading(2.5, 3.5, 1.1),
  h2: heading(2.25, 3, 1.2),
  h3: heading(2, 2.5, 1.2),
  h4: heading(1.5, 1.75, 1.4),
  h5: heading(1.25, 1.375, 1.4),
  h6: heading(1.125, 1.125, 1.4),
  subtitle1: { fontSize: '1.125rem', lineHeight: 1.5 },
  subtitle2: { fontSize: '1rem', lineHeight: 1.5, fontWeight: fontWeight.medium },
  body1: { fontSize: '1rem', lineHeight: 1.5 },
  body2: { fontSize: '0.875rem', lineHeight: 1.5 },
  button: { fontSize: '1rem', fontWeight: fontWeight.medium, textTransform: 'none', lineHeight: 1.5 },
  caption: { fontSize: '0.75rem', lineHeight: 1.4 },
  overline: { fontSize: '0.75rem', fontWeight: fontWeight.medium, letterSpacing: '0.08em', lineHeight: 1.4 },
};
