import MuiTypography, { type TypographyProps as MuiTypographyProps } from '@mui/material/Typography';
import type { ElementType } from 'react';

export type TypographyProps<C extends ElementType = 'span'> = MuiTypographyProps<C, { component?: C }>;

export const Typography = <C extends ElementType = 'span'>(props: TypographyProps<C>) => <MuiTypography {...props} />;
