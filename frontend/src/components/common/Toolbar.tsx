import MuiToolbar, { type ToolbarProps as MuiToolbarProps } from '@mui/material/Toolbar';

export type ToolbarProps = MuiToolbarProps;

export const Toolbar = (props: ToolbarProps) => <MuiToolbar {...props} />;
