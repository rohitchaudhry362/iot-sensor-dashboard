import MuiTextField, { type TextFieldProps as MuiTextFieldProps } from '@mui/material/TextField';

export type TextFieldProps = Omit<MuiTextFieldProps, 'error'> & {
  // A message puts the field in its error state and replaces the helper text.
  errorMessage?: string;
};

export const TextField = ({ errorMessage, helperText, ...props }: TextFieldProps) => (
  <MuiTextField {...props} error={Boolean(errorMessage)} helperText={errorMessage ?? helperText} />
);
