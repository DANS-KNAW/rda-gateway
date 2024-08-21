import * as Joi from 'joi';

const validationSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid('development', 'production')
    .default('development')
    .required(),
  API_PORT: Joi.number().default(3000).required(),
  API_KEY: Joi.string().required(),
  EXTENSION_API_KEY: Joi.string().required(),
  ELASTIC_INDEX: Joi.string().required(),

  RMQ_HOST: Joi.string().required(),
  RMQ_PORT: Joi.number().required(),
  RMQ_USER: Joi.string().required(),
  RMQ_PASS: Joi.string().required(),

  DB_HOST: Joi.string().required(),
  DB_PORT: Joi.number().required(),
  DB_USERNAME: Joi.string().required(),
  DB_PASSWORD: Joi.string().required(),
  DB_DATABASE: Joi.string().required(),
  DB_SYNCHRONIZE: Joi.boolean().required().default(false),
});

export default validationSchema;
