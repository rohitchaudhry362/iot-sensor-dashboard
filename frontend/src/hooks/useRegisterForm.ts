import { useMutation } from '@tanstack/react-query';
import { useState, type ChangeEvent, type FormEvent } from 'react';
import { isApiError, UNKNOWN_ERROR_MESSAGE } from '../api/errors';
import { register, type RegisterInput } from '../api/auth';
import { useAuth } from '../context/AuthContext';
import { hasErrors, validateRegister, type FieldErrors } from '../validation/auth';

export const useRegisterForm = () => {
  const { startSession } = useAuth();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<FieldErrors<RegisterInput>>({});
  const [formError, setFormError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: register,
    onSuccess: ({ user }) => startSession(user),
    onError: (err) => {
      if (isApiError(err) && err.code === 'EMAIL_TAKEN') setErrors({ email: err.message });
      else setFormError(isApiError(err) ? err.message : UNKNOWN_ERROR_MESSAGE);
    },
  });

  const clearError = (field: keyof RegisterInput) => setErrors((prev) => ({ ...prev, [field]: undefined }));

  const onChangeFirstName = (event: ChangeEvent<HTMLInputElement>) => {
    setFirstName(event.target.value);
    clearError('firstName');
  };

  const onChangeLastName = (event: ChangeEvent<HTMLInputElement>) => {
    setLastName(event.target.value);
    clearError('lastName');
  };

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
    const input = { firstName, lastName, email, password };
    const found = validateRegister(input);
    setErrors(found);
    if (!hasErrors(found)) mutation.mutate(input);
  };

  return {
    firstName,
    firstNameError: errors.firstName,
    onChangeFirstName,
    lastName,
    lastNameError: errors.lastName,
    onChangeLastName,
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
