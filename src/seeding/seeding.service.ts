import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { InjectRepository } from '@nestjs/typeorm';
import { parse } from 'csv-parse';
import { lastValueFrom } from 'rxjs';
import { MSG_BROKER_TOKEN } from 'src/constants';
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
import { EntityTarget, Repository, getRepository } from 'typeorm';

@Injectable()
export class SeedingService {
  constructor(
    @Inject(MSG_BROKER_TOKEN)
    private readonly msgBrokerClient: ClientProxy,

    @InjectRepository(Discipline)
    private readonly disciplineRepository: Repository<Discipline>,

    @InjectRepository(GORCAtribute)
    private readonly gorcAtributeRepository: Repository<GORCAtribute>,

    @InjectRepository(GORCElement)
    private readonly gorcElementRepository: Repository<GORCElement>,

    @InjectRepository(GroupGroup)
    private readonly groupGroupRepository: Repository<GroupGroup>,

    @InjectRepository(GroupResource)
    private readonly groupResourceRepository: Repository<GroupResource>,

    @InjectRepository(IndividualGroupAll)
    private readonly individualGroupAllRepository: Repository<IndividualGroupAll>,

    @InjectRepository(IndividualGroup)
    private readonly individualGroupRepository: Repository<IndividualGroup>,

    @InjectRepository(IndividualInstitution)
    private readonly individualInstitutionRepository: Repository<IndividualInstitution>,

    @InjectRepository(IndividualMember)
    private readonly individualMemberRepository: Repository<IndividualMember>,

    @InjectRepository(IndividualResource)
    private readonly individualResourceRepository: Repository<IndividualResource>,

    @InjectRepository(Individual)
    private readonly individualRepository: Repository<Individual>,

    @InjectRepository(InstitutionCountry)
    private readonly institutionCountryRepository: Repository<InstitutionCountry>,

    @InjectRepository(InstitutionInstitutionRole)
    private readonly institutionInstitutionRoleRepository: Repository<InstitutionInstitutionRole>,

    @InjectRepository(InstitutionOrganisationType)
    private readonly institutionOrganisationTypeRepository: Repository<InstitutionOrganisationType>,

    @InjectRepository(InstitutionRole)
    private readonly institutionRoleRepository: Repository<InstitutionRole>,

    @InjectRepository(Institution)
    private readonly institutionRepository: Repository<Institution>,

    @InjectRepository(InterestGroup)
    private readonly interestGroupRepository: Repository<InterestGroup>,

    @InjectRepository(OrgType)
    private readonly orgTypeRepository: Repository<OrgType>,

    @InjectRepository(Pathway)
    private readonly pathwayRepository: Repository<Pathway>,

    @InjectRepository(Relation)
    private readonly relationRepository: Repository<Relation>,

    @InjectRepository(ResourceDiscipline)
    private readonly resourceDisciplineRepository: Repository<ResourceDiscipline>,

    @InjectRepository(ResourceGORCAttribute)
    private readonly resourceGORCAttributeRepository: Repository<ResourceGORCAttribute>,

    @InjectRepository(ResourceGORCElement)
    private readonly resourceGORCElementRepository: Repository<ResourceGORCElement>,

    @InjectRepository(ResourcePathway)
    private readonly resourcePathwayRepository: Repository<ResourcePathway>,

    @InjectRepository(ResourceRelation)
    private readonly resourceRelationRepository: Repository<ResourceRelation>,

    @InjectRepository(ResourceRight)
    private readonly resourceRightRepository: Repository<ResourceRight>,

    @InjectRepository(ResourceWorkflow)
    private readonly resourceWorkflowRepository: Repository<ResourceWorkflow>,

    @InjectRepository(Resource)
    private readonly resourceRepository: Repository<Resource>,

    @InjectRepository(Right)
    private readonly rightRepository: Repository<Right>,

    @InjectRepository(SubjectResource)
    private readonly subjectResourceRepository: Repository<SubjectResource>,

    @InjectRepository(URIType)
    private readonly uriTypeRepository: Repository<URIType>,

    @InjectRepository(Workflow)
    private readonly workflowRepository: Repository<Workflow>,

    @InjectRepository(WorkingGroup)
    private readonly workingGroupRepository: Repository<WorkingGroup>,
  ) {}

  async ingestTsvFiles(files: Express.Multer.File[]) {
    const success = await lastValueFrom(
      this.msgBrokerClient.send({ cmd: 'create-index' }, 'rda'),
    )
      .then(() => true)
      .catch((error: Error) => {
        if (error.message == 'Alias already exists') {
          return true;
        }
        return false;
      });

    if (!success) {
      throw new BadRequestException('Failed to create index');
    }

    const start = performance.now();
    /**
     * 1. Parse the files to JSON.
     * 2. Insert each file into its respective table.
     * 3. Send all entries to the Elasticsearch service.
     **/
    let fileCount = 0;
    let totalItems = 0;
    for (const file of files) {
      const cleanedBuffer = this.preprocessBuffer(file.buffer);
      const parsedData = await this.parseCsvBuffer(cleanedBuffer);

      fileCount++;
      totalItems += parsedData.length;

      console.log({
        id: fileCount,
        file: file.originalname,
        items: parsedData.length,
      });

      if (file.originalname === 'Resource.tsv') {
        this.buildElasticDocument();
      }
      // switch (file.originalname) {
      //   case 'Disciplines.tsv':
      //     await this.saveObjectInOrder(this.disciplineRepository, parsedData);
      //     break;
      //   case 'GORC-attributes.tsv':
      //     await this.saveObjectInOrder(this.gorcAtributeRepository, parsedData);
      //     break;
      //   case 'GORC-Element.tsv':
      //     await this.saveObjectInOrder(this.gorcElementRepository, parsedData);
      //     break;
      //   case 'Group-Group.tsv':
      //     await this.saveObjectInOrder(this.groupGroupRepository, parsedData);
      //     break;
      //   case 'Group-Resource.tsv':
      //     await this.saveObjectInOrder(
      //       this.groupResourceRepository,
      //       parsedData,
      //     );
      //     break;
      //   case 'Individual-GroupAll.tsv':
      //     await this.saveObjectInOrder(
      //       this.individualGroupAllRepository,
      //       parsedData,
      //     );
      //     break;
      //   case 'Individual-Group.tsv':
      //     await this.saveObjectInOrder(
      //       this.individualGroupRepository,
      //       parsedData,
      //     );
      //     break;
      //   case 'Individual-Institution.tsv':
      //     await this.saveObjectInOrder(
      //       this.individualInstitutionRepository,
      //       parsedData,
      //     );
      //     break;
      //   case 'Individual-Member.tsv':
      //     await this.saveObjectInOrder(
      //       this.individualMemberRepository,
      //       parsedData,
      //     );
      //     break;
      //   case 'Individual-Resource.tsv':
      //     await this.saveObjectInOrder(
      //       this.individualResourceRepository,
      //       parsedData,
      //     );
      //     break;
      //   case 'Individual.tsv':
      //     await this.saveObjectInOrder(this.individualRepository, parsedData);
      //     break;
      //   case 'Institution-Country.tsv':
      //     await this.saveObjectInOrder(
      //       this.institutionCountryRepository,
      //       parsedData,
      //     );
      //     break;
      //   case 'Institution-InstitutionRole.tsv':
      //     await this.saveObjectInOrder(
      //       this.institutionInstitutionRoleRepository,
      //       parsedData,
      //     );
      //     break;
      //   case 'Institution-OrganisationType.tsv':
      //     await this.saveObjectInOrder(
      //       this.institutionOrganisationTypeRepository,
      //       parsedData,
      //     );
      //     break;
      //   case 'Institution_Roles.tsv':
      //     await this.saveObjectInOrder(
      //       this.institutionRoleRepository,
      //       parsedData,
      //     );
      //     break;
      //   case 'Institutions.tsv':
      //     await this.saveObjectInOrder(this.institutionRepository, parsedData);
      //     break;
      //   case 'InterestGroup.tsv':
      //     await this.saveObjectInOrder(
      //       this.interestGroupRepository,
      //       parsedData,
      //     );
      //     break;
      //   case 'OrgType.tsv':
      //     await this.saveObjectInOrder(this.orgTypeRepository, parsedData);
      //     break;
      //   case 'Pathway.tsv':
      //     await this.saveObjectInOrder(this.pathwayRepository, parsedData);
      //     break;
      //   case 'Relation.tsv':
      //     await this.saveObjectInOrder(this.relationRepository, parsedData);
      //     break;
      //   case 'Resource-Disciplines.tsv':
      //     await this.saveObjectInOrder(
      //       this.resourceDisciplineRepository,
      //       parsedData,
      //     );
      //     break;
      //   case 'Resource-GORC-Attribute.tsv':
      //     await this.saveObjectInOrder(
      //       this.resourceGORCAttributeRepository,
      //       parsedData,
      //     );
      //     break;
      //   case 'Resource-GORC-Element.tsv':
      //     await this.saveObjectInOrder(
      //       this.resourceGORCElementRepository,
      //       parsedData,
      //     );
      //     break;
      //   case 'Resource-Pathway.tsv':
      //     await this.saveObjectInOrder(
      //       this.resourcePathwayRepository,
      //       parsedData,
      //     );
      //     break;
      //   case 'Resource-Relation.tsv':
      //     await this.saveObjectInOrder(
      //       this.resourceRelationRepository,
      //       parsedData,
      //     );
      //     break;
      //   case 'Resource_Rights.tsv':
      //     await this.saveObjectInOrder(
      //       this.resourceRightRepository,
      //       parsedData,
      //     );
      //     break;
      //   case 'Resource-Workflow.tsv':
      //     await this.saveObjectInOrder(
      //       this.resourceWorkflowRepository,
      //       parsedData,
      //     );
      //     break;
      //   case 'Resource.tsv':
      //     await this.saveObjectInOrder(this.resourceRepository, parsedData);
      //     break;
      //   case 'Rights.tsv':
      //     await this.saveObjectInOrder(this.rightRepository, parsedData);
      //     break;
      //   case 'Subject-Resource.tsv':
      //     await this.saveObjectInOrder(
      //       this.subjectResourceRepository,
      //       parsedData,
      //     );
      //     break;
      //   case 'URI_Type.tsv':
      //     await this.saveObjectInOrder(this.uriTypeRepository, parsedData);
      //     break;
      //   case 'Workflow.tsv':
      //     await this.saveObjectInOrder(this.workflowRepository, parsedData);
      //     break;
      //   case 'WorkingGroup.tsv':
      //     await this.saveObjectInOrder(this.workingGroupRepository, parsedData);
      //     break;
      //   default:
      //     throw new Error('Invalid file name: ' + file.originalname);
      // }
    }
    const end = performance.now();
    return {
      duration: end - start,
      filesParsed: fileCount,
      totalItems: totalItems,
    };
  }

  private async buildElasticDocument() {
    const resources = await this.resourceRepository.find();
    const documents = await Promise.all(
      resources.map(async (resource) => {
        const subjectResources = await this.subjectResourceRepository.find({
          where: { uuid_resource: resource.uuid_rda },
        });

        const uriType = await this.uriTypeRepository.find({
          where: { uuid_uri_type: resource.uuid_uri_type },
        });

        const workflowsRelations = await this.resourceWorkflowRepository.find({
          where: { uuid_resource: resource.uuid_rda },
        });

        const workflow = await Promise.all(
          workflowsRelations.map(async (workflowRelation) => {
            const workflow = await this.workflowRepository.findOne({
              where: { UUID_Workflow: workflowRelation.uuid_adoption_state },
            });

            return {
              ...workflow,
              status: workflowRelation.status,
            };
          }),
        );

        const rightsResource = await this.resourceRightRepository.find({
          where: { uuid_resource: resource.uuid_rda },
        });

        return {
          ...resource,
          subjects: subjectResources,
          uri_type: uriType,
          workflows: workflow,
        };
      }),
    );
    console.log(documents.find((doc) => doc.uuid_rda === 'rda_graph:PID_0020'));
  }

  private async saveObjectInOrder<T>(
    repository: Repository<T>,
    objects: Record<string, string>[],
  ) {
    const entityFields: string[] = [];
    repository.metadata.columns.forEach((column) => {
      entityFields.push(column.propertyName);
    });

    const entityInstance = repository.create();

    for (const object of objects) {
      entityFields.forEach((field, index) => {
        entityInstance[field] = object[Object.keys(object)[index]];
      });
      try {
        await repository.save(entityInstance, { chunk: 1000 });
      } catch (error) {
        console.log(object);
        throw new Error(error);
      }
    }
  }

  private preprocessBuffer(buffer: Buffer): Buffer {
    const fileContent = buffer.toString('utf-8');
    const escapedContent = fileContent.replace(/"/g, '\\"');
    return Buffer.from(escapedContent, 'utf-8');
  }

  private parseCsvBuffer(buffer: Buffer): Promise<Record<string, string>[]> {
    return new Promise((resolve, reject) => {
      const records: Record<string, string>[] = [];
      const parser = parse({
        columns: true,
        delimiter: '\t',
        quote: null,
        escape: '\\',
      });

      parser.on('data', (row) => {
        records.push(row);
      });

      parser.on('end', () => {
        resolve(records);
      });

      parser.on('error', (error) => {
        reject(error);
      });

      parser.write(buffer);
      parser.end();
    });
  }
}
