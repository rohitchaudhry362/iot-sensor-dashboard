import { Alert, Button, Card, Link, PasswordField, Stack, TextField, Typography } from '../components/common';
import { useRegisterForm } from '../hooks/useRegisterForm';
import { AuthLayout } from '../layouts/AuthLayout';
import { space } from '../theme';

export const RegisterPage = () => {
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
    password,
    passwordError,
    onChangePassword,
    formError,
    isSubmitting,
    onSubmit,
  } = useRegisterForm();

  return (
    <AuthLayout>
      <Card>
        <Stack spacing={space.cardSmall}>
          <Stack spacing={1}>
            <Typography variant="h4" component="h1">
              Create your account
            </Typography>
            <Typography color="text.secondary">Start monitoring your home's sensors in real time.</Typography>
          </Stack>
          <Stack component="form" noValidate spacing={2.5} onSubmit={onSubmit}>
            {formError && <Alert severity="error">{formError}</Alert>}
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2.5}>
              <TextField
                label="First name"
                name="firstName"
                autoComplete="given-name"
                autoFocus
                value={firstName}
                onChange={onChangeFirstName}
                errorMessage={firstNameError}
                slotProps={{ htmlInput: { maxLength: 30 } }}
              />
              <TextField
                label="Last name"
                name="lastName"
                autoComplete="family-name"
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
              value={email}
              onChange={onChangeEmail}
              errorMessage={emailError}
              slotProps={{ htmlInput: { maxLength: 254 } }}
            />
            <PasswordField
              label="Password"
              name="password"
              autoComplete="new-password"
              value={password}
              onChange={onChangePassword}
              errorMessage={passwordError}
              helperText="At least 8 characters, with a letter and a number."
            />
            <Button type="submit" size="large" fullWidth loading={isSubmitting}>
              Create account
            </Button>
          </Stack>
        </Stack>
      </Card>
      <Typography sx={{ textAlign: 'center' }}>
        Already have an account? <Link to="/login">Sign in</Link>
      </Typography>
    </AuthLayout>
  );
};
