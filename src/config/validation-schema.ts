import * as Joi from 'joi';

const validationSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid('development', 'production')
    .default('development')
    .required(),
  API_PORT: Joi.number().default(3000).required(),
});

export default validationSchema;
