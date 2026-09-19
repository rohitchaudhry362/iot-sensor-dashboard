import MuiBox, { type BoxProps as MuiBoxProps } from '@mui/material/Box';
import type { ElementType } from 'react';

export type BoxProps<C extends ElementType = 'div'> = MuiBoxProps<C, { component?: C }>;

export const Box = <C extends ElementType = 'div'>(props: BoxProps<C>) => <MuiBox {...props} />;
