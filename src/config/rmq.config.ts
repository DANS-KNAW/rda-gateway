import { registerAs } from '@nestjs/config';

export const CONFIG_RMQ = 'rmq';

export default registerAs(CONFIG_RMQ, () => ({
  host: process.env.RMQ_HOST,
  port: parseInt(process.env.RMQ_PORT, 10) || 5672,
  username: process.env.RMQ_USER,
  password: process.env.RMQ_PASS,
  connectionUri: `amqp://${process.env.RMQ_USER}:${process.env.RMQ_PASS}@${process.env.RMQ_HOST}:${process.env.RMQ_PORT}`,
}));
