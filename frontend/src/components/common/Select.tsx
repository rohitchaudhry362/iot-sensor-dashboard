import MenuItem from '@mui/material/MenuItem';
import MuiTextField from '@mui/material/TextField';

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps {
  label: string;
  value: string;
  options: SelectOption[];
  onChange: (value: string) => void;
  minWidth?: number;
}

export const Select = ({ label, value, options, onChange, minWidth = 170 }: SelectProps) => (
  <MuiTextField
    select
    size="small"
    label={label}
    value={value}
    onChange={(event) => onChange(event.target.value)}
    fullWidth={false}
    sx={{ minWidth, width: '100%' }}
  >
    {options.map((option) => (
      <MenuItem key={option.value} value={option.value}>
        {option.label}
      </MenuItem>
    ))}
  </MuiTextField>
);
