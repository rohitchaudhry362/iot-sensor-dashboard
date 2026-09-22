import MuiTab, { type TabProps as MuiTabProps } from '@mui/material/Tab';
import MuiTabs, { type TabsProps as MuiTabsProps } from '@mui/material/Tabs';
import { Link as RouterLink, type To } from 'react-router-dom';

export type TabsProps = MuiTabsProps;

export const Tabs = (props: TabsProps) => <MuiTabs {...props} />;

export type LinkTabProps = Omit<MuiTabProps, 'href'> & {
  to: To;
  // Set by Tabs on each of its children at runtime; MUI's own types leave it out.
  selected?: boolean;
};

// A tab that navigates, marking the current page for screen readers.
export const LinkTab = ({ to, ...props }: LinkTabProps) => (
  <MuiTab component={RouterLink} to={to} aria-current={props.selected ? 'page' : undefined} {...props} />
);
