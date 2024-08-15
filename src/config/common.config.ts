import { registerAs } from '@nestjs/config';

export const COMMON_CONFIG = 'common-config';

export default registerAs(COMMON_CONFIG, () => ({
  node_env: process.env.NODE_ENV,
}));
