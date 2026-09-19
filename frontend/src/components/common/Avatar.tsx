import MuiAvatar, { type AvatarProps as MuiAvatarProps } from '@mui/material/Avatar';

export type AvatarProps = MuiAvatarProps;

export const Avatar = (props: AvatarProps) => <MuiAvatar {...props} />;
