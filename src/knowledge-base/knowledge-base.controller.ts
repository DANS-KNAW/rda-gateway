import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  Req,
} from '@nestjs/common';
import type { RawBodyRequest } from '@nestjs/common';
import { KnowledgeBaseService } from './knowledge-base.service';
import type { Annotation } from './types/annotation.interface';
import { CreateMetricDto } from './dto/create-metric.dto';

@Controller('knowledge-base')
export class KnowledgeBaseController {
  constructor(private readonly knowledgeBaseService: KnowledgeBaseService) {}

  @HttpCode(200)
  @Post('rda/_search')
  getAllDocuments(@Req() req: RawBodyRequest<Request>) {
    return this.knowledgeBaseService.getAllIndexDocuments(req.body as object);
  }

  @Get('rda/_source/:document')
  getDocument(@Param('document') document: string) {
    return this.knowledgeBaseService.getDocument(document);
  }

  @Post('/annotation')
  createAnnotation(@Body() body: Annotation) {
    return this.knowledgeBaseService.createAnnotation(body);
  }

  @Delete('/annotation/:id')
  deleteAnnotation(@Param('id') id: string) {
    return this.knowledgeBaseService.deleteAnnotation(id);
  }

  @Get('index/deposits')
  indexDeposits() {
    return this.knowledgeBaseService.indexAllDeposits();
  }

  @Get('index/annotations')
  indexAnnotations() {
    return this.knowledgeBaseService.indexAllAnnotations();
  }

  @HttpCode(201)
  @Post('metric')
  createMetric(@Body() body: CreateMetricDto) {
    return this.knowledgeBaseService.createMetric(body);
  }
}
