import { Module } from '@nestjs/common';
import { KnowledgeBaseService } from './knowledge-base.service';
import { KnowledgeBaseController } from './knowledge-base.controller';
import { ElasticsearchModule } from '@nestjs/elasticsearch';
import { ConfigModule, ConfigType } from '@nestjs/config';
import elasticsearchConfig from 'src/config/elasticsearch.config';
import { OrcidModule } from 'src/orcid/orcid.module';

@Module({
  imports: [
    ConfigModule.forFeature(elasticsearchConfig),
    ElasticsearchModule.registerAsync({
      imports: [ConfigModule.forFeature(elasticsearchConfig)],
      useFactory: (config: ConfigType<typeof elasticsearchConfig>) => ({
        nodes: config.ELASTIC_NODE_ENDPOINTS,
        auth: {
          username: config.ELASTIC_USERNAME,
          password: config.ELASTIC_PASSWORD,
        },
        maxRetries: 3,
        requestTimeout: 20000,
        tls: {
          rejectUnauthorized: config.ELASTIC_REJECT_UNAUTHORIZED === 'true',
        },
      }),
      inject: [elasticsearchConfig.KEY],
    }),
    OrcidModule,
  ],
  providers: [KnowledgeBaseService],
  controllers: [KnowledgeBaseController],
})
export class KnowledgeBaseModule {}
