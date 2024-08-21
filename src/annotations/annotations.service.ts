import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CreateAnnotationDto } from './dto/create-annotation.dto';
import { Resource } from 'src/entities/resource.entity';
import { customAlphabet } from 'nanoid';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GroupResource } from 'src/entities/group-resource.entity';
import { InterestGroup } from 'src/entities/interest-group.entity';
import { WorkingGroup } from 'src/entities/working-group.entity';
import { ResourcePathway } from 'src/entities/resource-pathway.entity';
import { Pathway } from 'src/entities/pathway.entity';
import { Discipline } from 'src/entities/discipline.entity';
import { ResourceDiscipline } from 'src/entities/resource-discipline.entity';
import { ResourceGORCAttribute } from 'src/entities/resource-gorc-attribute.entity';
import { GORCAtribute } from 'src/entities/gorc-attribute.entity';
import { ResourceGORCElement } from 'src/entities/resource-gorc-element.entity';
import { GORCElement } from 'src/entities/gorc-element.entity';
import { URIType } from 'src/entities/uri-type.entity';
import { lastValueFrom } from 'rxjs';
import { MSG_BROKER_TOKEN } from 'src/constants';
import { ClientProxy } from '@nestjs/microservices';
import { ResourceKeyword } from 'src/entities/resource-keyword.entity';
import { Keyword } from 'src/entities/keyword.entity';

@Injectable()
export class AnnotationsService {
  constructor(
    @InjectRepository(Resource)
    private readonly resourceRepository: Repository<Resource>,
    @InjectRepository(GroupResource)
    private readonly groupResourceRepository: Repository<GroupResource>,
    @InjectRepository(InterestGroup)
    private readonly interestGroupRepository: Repository<InterestGroup>,
    @InjectRepository(WorkingGroup)
    private readonly workingGroupRepository: Repository<WorkingGroup>,
    @InjectRepository(ResourcePathway)
    private readonly resourcePathwayRepository: Repository<ResourcePathway>,
    @InjectRepository(Pathway)
    private readonly pathwayRepository: Repository<Pathway>,
    @InjectRepository(ResourceDiscipline)
    private readonly resourceDisciplineRepository: Repository<ResourceDiscipline>,
    @InjectRepository(Discipline)
    private readonly disciplineRepository: Repository<Discipline>,
    @InjectRepository(ResourceGORCAttribute)
    private readonly resourceGORCAttributeRepository: Repository<ResourceGORCAttribute>,
    @InjectRepository(GORCAtribute)
    private readonly gorcAttributeRepository: Repository<GORCAtribute>,
    @InjectRepository(ResourceGORCElement)
    private readonly resourceGORCElementRepository: Repository<ResourceGORCElement>,
    @InjectRepository(GORCElement)
    private readonly gorcElementRepository: Repository<GORCElement>,
    @InjectRepository(URIType)
    private readonly uriTypeRepository: Repository<URIType>,
    @InjectRepository(ResourceKeyword)
    private readonly resourceKeywordRepository: Repository<ResourceKeyword>,
    @InjectRepository(Keyword)
    private readonly keywordRepository: Repository<Keyword>,
    @Inject(MSG_BROKER_TOKEN)
    private readonly msgBrokerClient: ClientProxy,
  ) {}

  async createAnnotation(createAnnotationDto: CreateAnnotationDto) {
    const nanoid = customAlphabet('1234567890ABCDEFGHIJKLMNOPQRSTUVWXZ');

    const convertDate = (date: string) => {
      const [year, month, day] = date.split('-');
      return `${day}-${month}-${year}`;
    };

    const resource = this.resourceRepository.create();
    resource.uuid = createAnnotationDto.page_url;
    resource.uuid_rda = `rda_tiger:${nanoid()}`;
    resource.uuid_uri_type = createAnnotationDto.uritype;
    resource.title = createAnnotationDto.citation.title;
    resource.notes = createAnnotationDto.citation.notes;
    resource.uri = createAnnotationDto.page_url;
    resource.dc_date = convertDate(createAnnotationDto.citation.created_at);
    resource.dc_description = createAnnotationDto.citation.description;
    resource.dc_language = createAnnotationDto.citation.language.value;
    resource.type = 'publication-other';
    resource.dc_type = 'Other';
    resource.fragment = createAnnotationDto.annotation;
    resource.source = 'Annotation';

    await this.resourceRepository.save(resource);

    const interestGroups = [];
    for (const annotationIG of createAnnotationDto.vocabularies
      .interest_groups) {
      const groupResource = this.groupResourceRepository.create({
        relation: 'wgLink',
        relation_uuid: 'rda_graph:T0ZC84O2',
        title_group: annotationIG.label,
        uuid_group: annotationIG.id,
        title_resource: resource.title,
        uuid_resource: resource.uuid_rda,
      });

      const interestGroup = await this.interestGroupRepository.findOne({
        where: { uuid_interestGroup: groupResource.uuid_group },
      });

      if (interestGroup == null) {
        throw new NotFoundException('Interest Group not found!');
      }

      await this.groupResourceRepository.save(groupResource);

      interestGroups.push({
        ...interestGroup,
        relation: groupResource.relation,
      });
    }

    const workingGroups = [];
    for (const annotationWG of createAnnotationDto.vocabularies
      .working_groups) {
      const groupResource = this.groupResourceRepository.create({
        relation: 'wgLink',
        relation_uuid: 'rda_graph:T0ZC84O2',
        title_group: annotationWG.label,
        uuid_group: annotationWG.id,
        title_resource: resource.title,
        uuid_resource: resource.uuid_rda,
      });

      const workingGroup = await this.workingGroupRepository.findOne({
        where: { uuid_working_group: groupResource.uuid_group },
      });

      if (workingGroup == null) {
        throw new NotFoundException('Working Group not found!');
      }

      await this.groupResourceRepository.save(groupResource);

      workingGroups.push({
        ...workingGroup,
        relation: groupResource.relation,
      });
    }

    const pathways = [];
    for (const annotationPathway of createAnnotationDto.vocabularies.pathways) {
      const ResourcePathway = this.resourcePathwayRepository.create({
        pathway: annotationPathway.label,
        uuid_pathway: annotationPathway.id,
        relation_uuid: 'rda_graph:E8904E44',
        relation: 'supports',
        resource: resource.title,
        uuid_resource: resource.uuid_rda,
      });

      const pathway = await this.pathwayRepository.findOne({
        where: { uuid_pathway: ResourcePathway.uuid_pathway },
      });

      if (pathway == null) {
        throw new NotFoundException('Pathway not found!');
      }

      await this.resourcePathwayRepository.save(ResourcePathway);

      pathways.push({
        ...pathway,
        relation: ResourcePathway.relation,
      });
    }

    const disciplines = [];
    for (const annotationDiscipline of createAnnotationDto.vocabularies
      .domains) {
      const resourceDiscipline = this.resourceDisciplineRepository.create({
        disciplines: annotationDiscipline.label,
        uuid_disciplines: annotationDiscipline.id,
        resource: resource.title,
        uuid_resource: resource.uuid_rda,
      });

      const discipline = await this.disciplineRepository.findOne({
        where: { uuid: resourceDiscipline.uuid_disciplines },
      });

      if (discipline == null) {
        throw new NotFoundException('Discipline not found!');
      }

      await this.resourceDisciplineRepository.save(resourceDiscipline);

      disciplines.push({
        ...discipline,
      });
    }

    const gorcAttributes = [];
    for (const annotationGORCAttribute of createAnnotationDto.vocabularies
      .gorc_attributes) {
      const resourceGORCAttribute = this.resourceGORCAttributeRepository.create(
        {
          attribute: annotationGORCAttribute.label,
          uuid_Attribute: annotationGORCAttribute.id,
          resource: resource.title,
          uuid_resource: resource.uuid_rda,
        },
      );

      const gorcAttribute = await this.gorcAttributeRepository.findOne({
        where: { uuid_attribute: resourceGORCAttribute.uuid_Attribute },
      });

      if (gorcAttribute == null) {
        throw new NotFoundException('GORC Attribute not found!');
      }

      await this.resourceGORCAttributeRepository.save(resourceGORCAttribute);

      gorcAttributes.push({
        ...gorcAttribute,
      });
    }

    const gorcElements = [];
    for (const annotationGORCElement of createAnnotationDto.vocabularies
      .gorc_elements) {
      const resourceGORCElement = this.resourceGORCElementRepository.create({
        element: annotationGORCElement.label,
        uuid_element: annotationGORCElement.id,
        resource: resource.title,
        uuid_resource: resource.uuid_rda,
      });

      const gorcElement = await this.gorcElementRepository.findOne({
        where: { uuid_element: resourceGORCElement.uuid_element },
      });

      if (gorcElement == null) {
        throw new NotFoundException('GORC Element not found!');
      }

      await this.resourceGORCElementRepository.save(resourceGORCElement);

      gorcElements.push({
        ...gorcElement,
      });
    }

    const uriType = await this.uriTypeRepository.find({
      where: { uri_type: resource.uuid_uri_type },
    });

    const keywords = [];
    for (const annotationKeyword of createAnnotationDto.vocabularies.keywords) {
      let newKeywordUuid = `rda_tiger:${nanoid()}`;

      const resourceKeyword = this.resourceKeywordRepository.create({
        uuid_keyword: annotationKeyword.id,
        uuid_resource: resource.uuid_rda,
      });

      let keyword = await this.keywordRepository.findOne({
        where: { keyword: annotationKeyword.label },
      });

      if (keyword == null) {
        keyword = await this.keywordRepository.save({
          keyword: annotationKeyword.label,
          uuid_keyword: newKeywordUuid,
        });
        resourceKeyword.uuid_keyword = newKeywordUuid;
      } else {
        resourceKeyword.uuid_keyword = keyword.uuid_keyword;
      }

      await this.resourceKeywordRepository.save(resourceKeyword);

      keywords.push({
        ...keyword,
      });
    }

    const document = {
      ...resource,
      interest_groups: interestGroups,
      working_groups: workingGroups,
      pathways: pathways,
      disciplines: disciplines,
      gorc_elements: gorcElements,
      gorc_attributes: gorcAttributes,
      uri_type: uriType,
      keywords: keywords,
    };

    const response = await lastValueFrom(
      this.msgBrokerClient.send(
        { cmd: 'index-document' },
        { alias: 'rda', body: document, customId: 'uuid_rda' },
      ),
    );

    return response;
  }
}
