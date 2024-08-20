import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateAnnotationDto } from './dto/create-annotation.dto';
import { Resource } from 'src/entities/resource.entity';
import { customAlphabet } from 'nanoid';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GroupResource } from 'src/entities/group-resource.entity';
import { InterestGroup } from 'src/entities/interest-group.entity';

@Injectable()
export class AnnotationsService {
  constructor(
    @InjectRepository(Resource)
    private readonly resourceRepository: Repository<Resource>,
    @InjectRepository(GroupResource)
    private readonly groupResourceRepository: Repository<GroupResource>,
    @InjectRepository(InterestGroup)
    private readonly interestGroupRepository: Repository<InterestGroup>,
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


    const interestGroups = []
    for (const annotationIG of createAnnotationDto.vocabularies.interest_groups) {
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
        throw new NotFoundException("Interest Group not found!");
      }

      await this.groupResourceRepository.save(groupResource);

      interestGroups.push({
        ...interestGroup,
        relation: groupResource.relation
      })
    }

    const document = {
      ...resource,
      interest_groups: interestGroups,
    };

    return 'This action adds a new annotation';
  }
}
