import { Module } from '@nestjs/common';
import { AnnotationsService } from './annotations.service';
import { AnnotationsController } from './annotations.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Discipline } from 'src/entities/discipline.entity';
import { GORCAtribute } from 'src/entities/gorc-attribute.entity';
import { GORCElement } from 'src/entities/gorc-element.entity';
import { GroupResource } from 'src/entities/group-resource.entity';
import { InterestGroup } from 'src/entities/interest-group.entity';
import { Pathway } from 'src/entities/pathway.entity';
import { ResourceDiscipline } from 'src/entities/resource-discipline.entity';
import { ResourceGORCAttribute } from 'src/entities/resource-gorc-attribute.entity';
import { ResourceGORCElement } from 'src/entities/resource-gorc-element.entity';
import { ResourcePathway } from 'src/entities/resource-pathway.entity';
import { Resource } from 'src/entities/resource.entity';
import { URIType } from 'src/entities/uri-type.entity';
import { WorkingGroup } from 'src/entities/working-group.entity';
import { ConfigModule, ConfigService, ConfigType } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import rmqConfig, { CONFIG_RMQ } from 'src/config/rmq.config';
import { MSG_BROKER_TOKEN } from 'src/constants';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Resource,
      GroupResource,
      InterestGroup,
      WorkingGroup,
      ResourcePathway,
      Pathway,
      Discipline,
      ResourceDiscipline,
      ResourceGORCAttribute,
      GORCAtribute,
      ResourceGORCElement,
      GORCElement,
      URIType,
    ]),
    ClientsModule.registerAsync([
      {
        name: MSG_BROKER_TOKEN,
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: async (configService: ConfigService) => {
          const config =
            configService.get<ConfigType<typeof rmqConfig>>(CONFIG_RMQ);

          return {
            transport: Transport.RMQ,
            options: {
              urls: [config.connectionUri],
            },
          };
        },
      },
    ]),
  ],
  controllers: [AnnotationsController],
  providers: [AnnotationsService],
})
export class AnnotationsModule {}
