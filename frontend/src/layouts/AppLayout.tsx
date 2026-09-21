import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { AppBar, Avatar, Box, Button, Logo, Stack, Toolbar, Typography } from '../components/common';
import { useAuth } from '../context/AuthContext';
import { LogoutRounded } from '../icons';
import { colors, gradients, layout } from '../theme';

export const AppLayout = () => {
  const { state: authState, logout } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const user = authState.user;

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
