import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { AppBar, Avatar, Box, Button, Logo, LogoutRounded, Stack, Toolbar, Typography } from '../components/common';
import { useAuth } from '../features/auth/AuthContext';
import { colors, layout } from '../theme';

export const AppLayout = () => {
  const { state, logout } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const user = state.user;

  const handleLogout = async () => {
    setIsLoggingOut(true);
    await logout();
  };

  return (
    <Box sx={{ minHeight: '100%' }}>
      <AppBar position="sticky">
        <Toolbar sx={{ minHeight: layout.headerHeight, px: layout.pagePaddingX, gap: 2 }}>
          <Logo size="small" />
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
      <Box component="main" sx={{ px: layout.pagePaddingX, py: 4, maxWidth: layout.contentMaxWidth, mx: 'auto' }}>
        <Outlet />
      </Box>
    </Box>
  );
};
