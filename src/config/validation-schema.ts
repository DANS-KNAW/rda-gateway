import * as Joi from 'joi';

const validationSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid('development', 'production')
    .default('development')
    .required(),
  API_PORT: Joi.number().default(3000).required(),
  API_KEY: Joi.string().required(),

  RMQ_HOST: Joi.string().required(),
  RMQ_PORT: Joi.number().required(),
  RMQ_USER: Joi.string().required(),
  RMQ_PASS: Joi.string().required(),
});

export default validationSchema;
