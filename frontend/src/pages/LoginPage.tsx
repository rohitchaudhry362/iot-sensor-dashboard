import { Alert, Button, Card, Link, PasswordField, Stack, TextField, Typography } from '../components/common';
import { useLoginForm } from '../hooks/useLoginForm';
import { AuthLayout } from '../layouts/AuthLayout';
import { space } from '../theme';

export const LoginPage = () => {
  const {
    email,
    emailError,
    onChangeEmail,
    password,
    passwordError,
    onChangePassword,
    formError,
    isSubmitting,
    onSubmit,
  } = useLoginForm();

  return (
    <AuthLayout>
      <Card>
        <Stack spacing={space.cardSmall}>
          <Stack spacing={1}>
            <Typography variant="h4" component="h1">
              Welcome back
            </Typography>
            <Typography color="text.secondary">Sign in to see what's happening at home.</Typography>
          </Stack>
          <Stack component="form" noValidate spacing={2.5} onSubmit={onSubmit}>
            {formError && <Alert severity="error">{formError}</Alert>}
            <TextField
              label="Email"
              name="email"
              type="email"
              autoComplete="email"
              autoFocus
              value={email}
              onChange={onChangeEmail}
              errorMessage={emailError}
            />
            <PasswordField
              label="Password"
              name="password"
              autoComplete="current-password"
              value={password}
              onChange={onChangePassword}
              errorMessage={passwordError}
            />
            <Button type="submit" size="large" fullWidth loading={isSubmitting}>
              Sign in
            </Button>
          </Stack>
        </Stack>
      </Card>
      <Typography sx={{ textAlign: 'center' }}>
        New here? <Link to="/register">Create an account</Link>
      </Typography>
    </AuthLayout>
  );
};
