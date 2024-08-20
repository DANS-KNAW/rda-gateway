import { Injectable } from '@nestjs/common';
import { CreateAnnotationDto } from './dto/create-annotation.dto';
import { Resource } from 'src/entities/resource.entity';
import { customAlphabet } from 'nanoid';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class AnnotationsService {
  constructor(
    @InjectRepository(Resource)
    private readonly resourceRepository: Repository<Resource>,
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

    const document = {
      ...resource,
    };

    return 'This action adds a new annotation';
  }
}
