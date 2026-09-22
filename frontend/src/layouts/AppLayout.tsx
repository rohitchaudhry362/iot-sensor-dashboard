import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { AppBar, Avatar, Box, Button, LinkTab, Logo, Stack, Tabs, Toolbar, Typography } from '../components/common';
import { useAuth } from '../context/AuthContext';
import { LogoutRounded } from '../icons';
import { borderWidth, colors, gradients, layout } from '../theme';

const NAV_TABS = [
  { label: 'Dashboard', path: '/' },
  { label: 'Profile', path: '/profile' },
] as const;

export const AppLayout = () => {
  const { state: authState, logout } = useAuth();
  const location = useLocation();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const user = authState.user;
  const activeTabPath = NAV_TABS.find((tab) => tab.path === location.pathname)?.path ?? false;

  const handleLogout = async () => {
    setIsLoggingOut(true);
    await logout();
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        backgroundColor: colors.beige,
        backgroundImage: gradients.page,
        backgroundRepeat: 'no-repeat',
        pt: `${layout.headerFloatGap}px`,
      }}
    >
      <AppBar position="sticky">
        <Toolbar
          sx={{
            minHeight: layout.headerHeight,
            px: layout.pagePaddingX,
            py: { xs: 1, md: 0 },
            columnGap: 2,
            flexWrap: 'wrap',
          }}
        >
          <Logo size="small" />
          <Tabs
            value={activeTabPath}
            role="navigation"
            aria-label="Main"
            sx={{
              order: { xs: 1, md: 0 },
              width: { xs: '100%', md: 'auto' },
              mt: { xs: 1, md: 0 },
              borderTop: { xs: `${borderWidth}px solid ${colors.border}`, md: 'none' },
            }}
          >
            {NAV_TABS.map((tab) => (
              <LinkTab
                key={tab.path}
                value={tab.path}
                label={tab.label}
                to={tab.path}
                sx={{ flex: { xs: 1, md: 'none' } }}
              />
            ))}
          </Tabs>
          <Box sx={{ flexGrow: 1 }} />
          {user && (
            <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
              <Avatar
                sx={{ width: 32, height: 32, bgcolor: colors.brand[200], color: colors.brand[700], fontSize: 14 }}
              >
                {user.firstName[0]}
                {user.lastName[0]}
              </Avatar>
              <Typography sx={{ display: { xs: 'none', sm: 'block' }, fontWeight: 500 }}>
                {user.firstName} {user.lastName}
              </Typography>
            </Stack>
          )}
          <Button
            variant="outlined"
            size="small"
            startIcon={<LogoutRounded />}
            loading={isLoggingOut}
            onClick={handleLogout}
          >
            Log out
          </Button>
        </Toolbar>
      </AppBar>
      {/* Less padding above than below: the floating header already leaves a gap under itself, so the full
          amount here read as a hole between the bar and the greeting. */}
      <Box
        component="main"
        sx={{ px: layout.pagePaddingX, pt: 2, pb: 4, maxWidth: layout.contentMaxWidth, mx: 'auto' }}
      >
        <Outlet />
      </Box>
    </Box>
  );
};
