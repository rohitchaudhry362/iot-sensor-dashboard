import MuiButton, { type ButtonProps as MuiButtonProps } from '@mui/material/Button';

export type ButtonProps = MuiButtonProps;

export const Button = (props: ButtonProps) => <MuiButton {...props} />;
