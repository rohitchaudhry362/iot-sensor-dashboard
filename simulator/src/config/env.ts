import dotenv from 'dotenv';
import Joi from 'joi';

dotenv.config({ quiet: true });

export interface Env {
  NODE_ENV: 'development' | 'production';
  LOG_LEVEL: 'error' | 'warn' | 'info' | 'debug';
  MQTT_URL: string;
  NETWORK_ID: number;
}

const schema = Joi.object<Env>({
  NODE_ENV: Joi.string().valid('development', 'production').default('development').example('production'),
  LOG_LEVEL: Joi.string().valid('error', 'warn', 'info', 'debug').default('info').example('debug'),
  MQTT_URL: Joi.string()
    .uri({ scheme: ['mqtt', 'mqtts'] })
    .default('mqtt://localhost:1883')
    .example('mqtt://mosquitto:1883'),
  NETWORK_ID: Joi.number().integer().min(1).default(1).example(1),
}).unknown(true);

const { value: validatedEnv, error: validationError } = schema.validate(process.env, { abortEarly: false });

if (validationError) {
  process.stderr.write(`Invalid environment configuration: ${validationError.message}\n`);
  process.exit(1);
}

export const env: Env = validatedEnv as Env;
