import MuiStack, { type StackProps as MuiStackProps } from '@mui/material/Stack';
import type { ElementType } from 'react';

export type StackProps<C extends ElementType = 'div'> = MuiStackProps<C, { component?: C }>;

export const Stack = <C extends ElementType = 'div'>(props: StackProps<C>) => <MuiStack {...props} />;
