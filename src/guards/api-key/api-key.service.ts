import { Inject, Injectable } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { valid } from 'joi';
import commonConfig from 'src/config/common.config';

@Injectable()
export class ApiKeyService {
  constructor(
    @Inject(commonConfig.KEY)
    private readonly config: ConfigType<typeof commonConfig>,
  ) {}

  async validateApiKey(apiKey: string): Promise<boolean> {
    if (!apiKey || typeof apiKey !== 'string') return false;
    return apiKey === this.config.extension_api_key;
  }
}
