import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateAnnotationDto } from './dto/create-annotation.dto';
import { Resource } from 'src/entities/resource.entity';
import { customAlphabet } from 'nanoid';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { GroupResource } from 'src/entities/group-resource.entity';
import { InterestGroup } from 'src/entities/interest-group.entity';
import { WorkingGroup } from 'src/entities/working-group.entity';
import { ResourcePathway } from 'src/entities/resource-pathway.entity';
import { Pathway } from 'src/entities/pathway.entity';

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
  ) {}

  async createAnnotation(createAnnotationDto: CreateAnnotationDto) {
    const nanoid = customAlphabet('1234567890ABCDEFGHIJKLMNOPQRSTUVWXZ');

    const resource = this.resourceRepository.create();
    resource.uuid = createAnnotationDto.page_url;
    resource.uuid_rda = `rda_tiger:${nanoid()}`;
    resource.uuid_uri_type = createAnnotationDto.uritype;
    resource.title = createAnnotationDto.citation.title;
    resource.notes = createAnnotationDto.citation.notes;
    resource.uri = createAnnotationDto.page_url;
    // resource.dc_date = date;
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

    const document = {
      ...resource,
      interest_groups: interestGroups,
      working_groups: workingGroups,
      pathways: pathways,
    };

    return 'This action adds a new annotation';
  }
}
