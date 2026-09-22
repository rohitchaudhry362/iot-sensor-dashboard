import type { User } from '../api/types';
import { Alert, Box, Button, Card, Link, Stack, TextField, Typography } from '../components/common';
import { useAuth } from '../context/AuthContext';
import { useProfileForm } from '../hooks/useProfileForm';
import { layout, space } from '../theme';
import { formatCalendarDate } from '../util/time';

const ProfileForm = ({ user }: { user: User }) => {
  const {
    firstName,
    firstNameError,
    onChangeFirstName,
    lastName,
    lastNameError,
    onChangeLastName,
    email,
    emailError,
    onChangeEmail,
    formError,
    isSaved,
    hasChanges,
    isSubmitting,
    onSubmit,
  } = useProfileForm(user);

  return (
    <Card>
      <Stack component="form" noValidate spacing={2.5} onSubmit={onSubmit}>
        {formError && <Alert severity="error">{formError}</Alert>}
        {isSaved && <Alert severity="success">Your profile has been saved.</Alert>}
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2.5}>
          <TextField
            label="First name"
            name="firstName"
            autoComplete="given-name"
            fullWidth
            value={firstName}
            onChange={onChangeFirstName}
            errorMessage={firstNameError}
            slotProps={{ htmlInput: { maxLength: 30 } }}
          />
          <TextField
            label="Last name"
            name="lastName"
            autoComplete="family-name"
            fullWidth
            value={lastName}
            onChange={onChangeLastName}
            errorMessage={lastNameError}
            slotProps={{ htmlInput: { maxLength: 30 } }}
          />
        </Stack>
        <TextField
          label="Email"
          name="email"
          type="email"
          autoComplete="email"
          fullWidth
          value={email}
          onChange={onChangeEmail}
          errorMessage={emailError}
          helperText="You sign in with this address."
          slotProps={{ htmlInput: { maxLength: 254 } }}
        />
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            gap: 2,
            alignItems: { sm: 'center' },
            justifyContent: 'space-between',
          }}
        >
          <Typography variant="body2" color="text.secondary">
            Member since {formatCalendarDate(user.createdAt)}
          </Typography>
          <Button type="submit" disabled={!hasChanges} loading={isSubmitting}>
            Save changes
          </Button>
        </Box>
      </Stack>
    </Card>
  );
};

export const ProfilePage = () => {
  const { state: authState } = useAuth();
  if (!authState.user) return null;

  return (
    <Stack spacing={space.cardSmall} sx={{ maxWidth: layout.profileFormMaxWidth }}>
      <Box>
        <Typography variant="h3" component="h1">
          Your profile
        </Typography>
        <Typography color="text.secondary">Check and update your name and email address.</Typography>
      </Box>
      <ProfileForm user={authState.user} />
      <Link to="/">Back to the dashboard</Link>
    </Stack>
  );
};
