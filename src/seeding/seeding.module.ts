import { Module } from '@nestjs/common';
import { SeedingService } from './seeding.service';
import { SeedingController } from './seeding.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Discipline } from 'src/entities/discipline.entity';
import { GORCAtribute } from 'src/entities/gorc-attribute.entity';
import { GORCElement } from 'src/entities/gorc-element.entity';
import { GroupGroup } from 'src/entities/group-group.entity';
import { GroupResource } from 'src/entities/group-resource.entity';
import { IndividualGroupAll } from 'src/entities/individual-group-all.entity';
import { IndividualGroup } from 'src/entities/individual-group.entity';
import { IndividualInstitution } from 'src/entities/individual-institution.entity';
import { IndividualMember } from 'src/entities/individual-member.entity';
import { IndividualResource } from 'src/entities/individual-resource.entity';
import { Individual } from 'src/entities/individual.entity';
import { InstitutionCountry } from 'src/entities/institution-country.entity';
import { InstitutionInstitutionRole } from 'src/entities/institution-institution-role.entity';
import { InstitutionOrganisationType } from 'src/entities/institution-organisation-type.entity';
import { InstitutionRole } from 'src/entities/institution-role.entity';
import { Institution } from 'src/entities/institution.entity';
import { InterestGroup } from 'src/entities/interest-group.entity';
import { OrgType } from 'src/entities/org-type.entity';
import { Pathway } from 'src/entities/pathway.entity';
import { Relation } from 'src/entities/relation.entity';
import { ResourceDiscipline } from 'src/entities/resource-discipline.entity';
import { ResourceGORCAttribute } from 'src/entities/resource-gorc-attribute.entity';
import { ResourceGORCElement } from 'src/entities/resource-gorc-element.entity';
import { ResourcePathway } from 'src/entities/resource-pathway.entity';
import { ResourceRelation } from 'src/entities/resource-relation.entity';
import { ResourceRight } from 'src/entities/resource-right.entity';
import { ResourceWorkflow } from 'src/entities/resource-workflow.entity';
import { Right } from 'src/entities/right.entity';
import { SubjectResource } from 'src/entities/subject-resource.entity';
import { URIType } from 'src/entities/uri-type.entity';
import { Workflow } from 'src/entities/workflow.entity';
import { WorkingGroup } from 'src/entities/working-group.entity';
import { Resource } from 'src/resources/entities/resource.entity';
import { ConfigModule, ConfigService, ConfigType } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import rmqConfig, { CONFIG_RMQ } from 'src/config/rmq.config';
import { MSG_BROKER_TOKEN } from 'src/constants';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Discipline,
      GORCAtribute,
      GORCElement,
      GroupGroup,
      GroupResource,
      IndividualGroupAll,
      IndividualGroup,
      IndividualInstitution,
      IndividualMember,
      IndividualResource,
      Individual,
      InstitutionCountry,
      InstitutionInstitutionRole,
      InstitutionOrganisationType,
      InstitutionRole,
      Institution,
      InterestGroup,
      OrgType,
      Pathway,
      Relation,
      ResourceDiscipline,
      ResourceGORCAttribute,
      ResourceGORCElement,
      ResourcePathway,
      ResourceRelation,
      ResourceRight,
      ResourceWorkflow,
      Resource,
      Right,
      SubjectResource,
      URIType,
      Workflow,
      WorkingGroup,
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
  controllers: [SeedingController],
  providers: [SeedingService],
})
export class SeedingModule {}
