import MuiLink, { type LinkProps as MuiLinkProps } from '@mui/material/Link';
import { Link as RouterLink, type To } from 'react-router-dom';

export type LinkProps = Omit<MuiLinkProps, 'href'> & {
  to: To;
};

export const Link = ({ to, ...props }: LinkProps) => <MuiLink component={RouterLink} to={to} {...props} />;
