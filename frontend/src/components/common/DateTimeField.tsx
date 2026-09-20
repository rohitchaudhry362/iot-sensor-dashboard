import MuiTextField from '@mui/material/TextField';

export interface DateTimeFieldProps {
  label: string;
  // "YYYY-MM-DDTHH:mm" in the viewer's own time zone.
  value: string;
  max?: string;
  onChange: (value: string) => void;
}

export const DateTimeField = ({ label, value, max, onChange }: DateTimeFieldProps) => (
  <MuiTextField
    type="datetime-local"
    size="small"
    label={label}
    value={value}
    onChange={(event) => onChange(event.target.value)}
    fullWidth={false}
    slotProps={{ inputLabel: { shrink: true }, htmlInput: { max } }}
    sx={{ minWidth: 220, width: '100%' }}
  />
);
