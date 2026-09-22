import Joi from 'joi';
import type { LoginInput, ProfileInput, RegisterInput } from '../api/auth';

export type FieldErrors<T> = Partial<Record<keyof T, string>>;

const PASSWORD_MAX_BYTES = 72;
const byteLength = (value: string): number => new TextEncoder().encode(value).length;

const email = Joi.string()
  .trim()
  .max(254)
  .email({ tlds: { allow: false } })
  .required()
  .messages({
    'string.empty': 'Email is required',
    'any.required': 'Email is required',
    'string.email': 'Enter a valid email address',
    'string.max': 'Email must be at most 254 characters',
  });

const personName = (label: string) =>
  Joi.string()
    .trim()
    .max(30)
    .pattern(/^[\p{L}\p{M}' -]+$/u)
    .required()
    .messages({
      'string.empty': `${label} is required`,
      'any.required': `${label} is required`,
      'string.max': `${label} must be at most 30 characters`,
      'string.pattern.base': `${label} can only contain letters, spaces, hyphens and apostrophes`,
    });

const newPassword = Joi.string()
  .min(8)
  .pattern(/[A-Za-z]/, 'letter')
  .pattern(/\d/, 'number')
  .custom((value: string, helpers) =>
    byteLength(value) > PASSWORD_MAX_BYTES ? helpers.error('string.maxBytes') : value,
  )
  .required()
  .messages({
    'string.empty': 'Password is required',
    'any.required': 'Password is required',
    'string.min': 'Password must be at least 8 characters',
    'string.pattern.name': 'Password must contain at least one {#name}',
    'string.maxBytes': 'Password is too long',
  });

const registerSchema = Joi.object<RegisterInput>({
  firstName: personName('First name'),
  lastName: personName('Last name'),
  email,
  password: newPassword,
});

const profileSchema = Joi.object<ProfileInput>({
  firstName: personName('First name'),
  lastName: personName('Last name'),
  email,
});

const loginSchema = Joi.object<LoginInput>({
  email,
  password: Joi.string().required().messages({
    'string.empty': 'Password is required',
    'any.required': 'Password is required',
  }),
});

const toFieldErrors = <T extends object>(schema: Joi.ObjectSchema<T>, input: T): FieldErrors<T> => {
  const errors: FieldErrors<T> = {};
  schema.validate(input, { abortEarly: false }).error?.details.forEach((detail) => {
    const field = detail.path[0] as keyof T;
    errors[field] ??= detail.message;
  });
  return errors;
};

export const validateLogin = (input: LoginInput): FieldErrors<LoginInput> => toFieldErrors(loginSchema, input);

export const validateRegister = (input: RegisterInput): FieldErrors<RegisterInput> =>
  toFieldErrors(registerSchema, input);

export const validateProfile = (input: ProfileInput): FieldErrors<ProfileInput> => toFieldErrors(profileSchema, input);

export const hasErrors = <T>(errors: FieldErrors<T>): boolean => Object.keys(errors).length > 0;
