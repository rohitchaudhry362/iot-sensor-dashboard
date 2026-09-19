import MuiAppBar, { type AppBarProps as MuiAppBarProps } from '@mui/material/AppBar';

export type AppBarProps = MuiAppBarProps;

export const AppBar = (props: AppBarProps) => <MuiAppBar {...props} />;
