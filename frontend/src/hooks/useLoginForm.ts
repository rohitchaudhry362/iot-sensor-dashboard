import { useMutation } from '@tanstack/react-query';
import { useState, type ChangeEvent, type FormEvent } from 'react';
import { isApiError, UNKNOWN_ERROR_MESSAGE } from '../api/errors';
import { login, type LoginInput } from '../features/auth/api';
import { useAuth } from '../features/auth/AuthContext';
import { hasErrors, validateLogin, type FieldErrors } from '../features/auth/validation';

export const useLoginForm = () => {
  const { sessionStarted } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<FieldErrors<LoginInput>>({});
  const [formError, setFormError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: login,
    onSuccess: ({ user }) => sessionStarted(user),
    onError: (err) => setFormError(isApiError(err) ? err.message : UNKNOWN_ERROR_MESSAGE),
  });

  const clearError = (field: keyof LoginInput) => setErrors((prev) => ({ ...prev, [field]: undefined }));

  const onChangeEmail = (event: ChangeEvent<HTMLInputElement>) => {
    setEmail(event.target.value);
    clearError('email');
  };

  const onChangePassword = (event: ChangeEvent<HTMLInputElement>) => {
    setPassword(event.target.value);
    clearError('password');
  };

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);
    const input = { email, password };
    const found = validateLogin(input);
    setErrors(found);
    if (!hasErrors(found)) mutation.mutate(input);
  };

  return {
    email,
    emailError: errors.email,
    onChangeEmail,
    password,
    passwordError: errors.password,
    onChangePassword,
    formError,
    isSubmitting: mutation.isPending,
    onSubmit,
  };
};
