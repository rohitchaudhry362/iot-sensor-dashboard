import dotenv from 'dotenv'
import Joi from 'joi'

dotenv.config({ quiet: true })

export interface Env {
  NODE_ENV: 'development' | 'production' | 'test'
  PORT: number
  LOG_LEVEL: 'error' | 'warn' | 'info' | 'http' | 'debug'
  CORS_ORIGIN: string
}

const schema = Joi.object<Env>({
  NODE_ENV: Joi.string().valid('development', 'production', 'test').default('development'),
  PORT: Joi.number().port().default(5000),
  LOG_LEVEL: Joi.string().valid('error', 'warn', 'info', 'http', 'debug').default('info'),
  CORS_ORIGIN: Joi.string().uri().default('http://localhost:3000'),
}).unknown(true)

const { value, error } = schema.validate(process.env, { abortEarly: false })

if (error) {
  process.stderr.write(`Invalid environment configuration: ${error.message}\n`)
  process.exit(1)
}

export const env: Env = value as Env
