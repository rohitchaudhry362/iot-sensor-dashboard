import MuiChip, { type ChipProps as MuiChipProps } from '@mui/material/Chip';

export type ChipProps = MuiChipProps;

export const Chip = (props: ChipProps) => <MuiChip {...props} />;
