import Joi from 'joi';

export interface RegisterInput {
  email: string;
  firstName: string;
  lastName: string;
  password: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

// bcrypt only uses the first 72 bytes of a password, so longer ones are rejected rather than silently truncated.
const BCRYPT_MAX_BYTES = 72;

const email = Joi.string()
  .trim()
  .lowercase()
  .max(254)
  .email({ tlds: { allow: false } })
  .required()
  .example('jane.doe@example.com');

const personName = Joi.string()
  .trim()
  .min(1)
  .max(30)
  .pattern(/^[\p{L}\p{M}' -]+$/u)
  .required();

const newPassword = Joi.string()
  .min(8)
  .pattern(/[A-Za-z]/, 'letter')
  .pattern(/\d/, 'number')
  .custom((value: string, helpers) =>
    Buffer.byteLength(value, 'utf8') > BCRYPT_MAX_BYTES ? helpers.error('any.invalid') : value,
  )
  .required()
  .example('CorrectHorse9');

export const registerSchema = Joi.object<RegisterInput>({
  email,
  firstName: personName.example('Jane'),
  lastName: personName.example('Doe'),
  password: newPassword,
}).example({
  email: 'jane.doe@example.com',
  firstName: 'Jane',
  lastName: 'Doe',
  password: 'CorrectHorse9',
});

export const loginSchema = Joi.object<LoginInput>({
  email,
  password: Joi.string().max(BCRYPT_MAX_BYTES).required().example('CorrectHorse9'),
}).example({ email: 'jane.doe@example.com', password: 'CorrectHorse9' });
