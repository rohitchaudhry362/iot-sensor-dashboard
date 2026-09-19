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
}

const schema = Joi.object<Env>({
  NODE_ENV: Joi.string().valid('development', 'production', 'test').default('development'),
  PORT: Joi.number().port().default(5000),
  LOG_LEVEL: Joi.string().valid('error', 'warn', 'info', 'http', 'debug').default('info'),
  CORS_ORIGIN: Joi.string().uri().default('http://localhost:3000'),
  DATABASE_URL: Joi.string().uri({ scheme: ['postgresql', 'postgres'] }).required(),
  DATA_DIR: Joi.string().default(path.resolve(__dirname, '../../../data')),
}).unknown(true)

const { value, error } = schema.validate(process.env, { abortEarly: false })

if (error) {
  process.stderr.write(`Invalid environment configuration: ${error.message}\n`)
  process.exit(1)
}

export const env: Env = value as Env
