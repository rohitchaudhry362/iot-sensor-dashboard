import dotenv from 'dotenv'
import Joi from 'joi'
import path from 'node:path'

dotenv.config({ quiet: true })

export interface Env {
  NODE_ENV: 'development' | 'production' | 'test'
  PORT: number
  LOG_LEVEL: 'error' | 'warn' | 'info' | 'http' | 'debug'
  CORS_ORIGIN: string
  DATABASE_URL: string
  DATA_DIR: string
  JWT_SECRET: string
  JWT_ACCESS_TTL_SECONDS: number
  REFRESH_TOKEN_TTL_DAYS: number
  BCRYPT_COST: number
  COOKIE_SECURE: boolean
}

const schema = Joi.object<Env>({
  NODE_ENV: Joi.string().valid('development', 'production', 'test').default('development'),
  PORT: Joi.number().port().default(4000),
  LOG_LEVEL: Joi.string().valid('error', 'warn', 'info', 'http', 'debug').default('info'),
  CORS_ORIGIN: Joi.string().uri().default('http://localhost:3000'),
  DATABASE_URL: Joi.string().uri({ scheme: ['postgresql', 'postgres'] }).required(),
  DATA_DIR: Joi.string().default(path.resolve(__dirname, '../../../data')),
  JWT_SECRET: Joi.string().min(32).required(),
  JWT_ACCESS_TTL_SECONDS: Joi.number().integer().min(60).default(900),
  REFRESH_TOKEN_TTL_DAYS: Joi.number().integer().min(1).max(90).default(7),
  BCRYPT_COST: Joi.number().integer().min(4).max(15).default(12),
  COOKIE_SECURE: Joi.boolean().when('NODE_ENV', {
    is: 'production',
    then: Joi.boolean().default(true),
    otherwise: Joi.boolean().default(false),
  }),
}).unknown(true)

const { value, error } = schema.validate(process.env, { abortEarly: false })

if (error) {
  process.stderr.write(`Invalid environment configuration: ${error.message}\n`)
  process.exit(1)
}

export const env: Env = value as Env
