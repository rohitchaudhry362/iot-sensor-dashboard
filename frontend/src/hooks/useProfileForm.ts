import { useMutation } from '@tanstack/react-query';
import { useState, type ChangeEvent, type FormEvent } from 'react';
import { updateProfile, type ProfileInput } from '../api/auth';
import { isApiError, UNKNOWN_ERROR_MESSAGE } from '../api/errors';
import type { User } from '../api/types';
import { useAuth } from '../context/AuthContext';
import { hasErrors, validateProfile, type FieldErrors } from '../validation/auth';

export const useProfileForm = (user: User) => {
  const { updateUser } = useAuth();
  const [firstName, setFirstName] = useState(user.firstName);
  const [lastName, setLastName] = useState(user.lastName);
  const [email, setEmail] = useState(user.email);
  const [errors, setErrors] = useState<FieldErrors<ProfileInput>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState(false);

  const mutation = useMutation({
    mutationFn: updateProfile,
    onSuccess: (updatedUser) => {
      updateUser(updatedUser);
      setFirstName(updatedUser.firstName);
      setLastName(updatedUser.lastName);
      setEmail(updatedUser.email);
      setIsSaved(true);
    },
    onError: (err) => {
      if (isApiError(err) && err.code === 'EMAIL_TAKEN') setErrors({ email: err.message });
      else setFormError(isApiError(err) ? err.message : UNKNOWN_ERROR_MESSAGE);
    },
  });

  const onFieldEdited = (field: keyof ProfileInput) => {
    setErrors((previousErrors) => ({ ...previousErrors, [field]: undefined }));
    setIsSaved(false);
  };

  const onChangeFirstName = (event: ChangeEvent<HTMLInputElement>) => {
    setFirstName(event.target.value);
    onFieldEdited('firstName');
  };

  const onChangeLastName = (event: ChangeEvent<HTMLInputElement>) => {
    setLastName(event.target.value);
    onFieldEdited('lastName');
  };

  const onChangeEmail = (event: ChangeEvent<HTMLInputElement>) => {
    setEmail(event.target.value);
    onFieldEdited('email');
  };

  const hasChanges =
    firstName.trim() !== user.firstName ||
    lastName.trim() !== user.lastName ||
    email.trim().toLowerCase() !== user.email;

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);
    const input = { firstName, lastName, email };
    const fieldErrors = validateProfile(input);
    setErrors(fieldErrors);
    if (!hasErrors(fieldErrors)) mutation.mutate(input);
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
    formError,
    isSaved,
    hasChanges,
    isSubmitting: mutation.isPending,
    onSubmit,
  };
};
