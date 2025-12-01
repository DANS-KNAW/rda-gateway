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
import {
  ApiCreatedResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { KnowledgeBaseService } from './knowledge-base.service';
import type { Annotation } from './types/annotation.interface';
import { CreateMetricDto } from './dto/create-metric.dto';

@ApiTags('Knowledge Base')
@Controller('knowledge-base')
export class KnowledgeBaseController {
  constructor(private readonly knowledgeBaseService: KnowledgeBaseService) {}

  @HttpCode(200)
  @Post('rda/_search')
  @ApiOperation({ summary: 'Search documents in the knowledge base' })
  getAllDocuments(@Req() req: RawBodyRequest<Request>) {
    return this.knowledgeBaseService.getAllIndexDocuments(req.body as object);
  }

  @Get('rda/_source/:document')
  @ApiOperation({ summary: 'Get a document by ID' })
  @ApiParam({ name: 'document', description: 'Document identifier' })
  getDocument(@Param('document') document: string) {
    return this.knowledgeBaseService.getDocument(document);
  }

  @Post('/annotation')
  @ApiOperation({ summary: 'Create an annotation' })
  createAnnotation(@Body() body: Annotation) {
    return this.knowledgeBaseService.createAnnotation(body);
  }

  @Delete('/annotation/:id')
  @ApiOperation({ summary: 'Delete an annotation' })
  @ApiParam({ name: 'id', description: 'Annotation identifier' })
  deleteAnnotation(@Param('id') id: string) {
    return this.knowledgeBaseService.deleteAnnotation(id);
  }

  @Get('index/deposits')
  @ApiOperation({ summary: 'Trigger indexing of all deposits' })
  indexDeposits() {
    return this.knowledgeBaseService.indexAllDeposits();
  }

  @Get('index/annotations')
  @ApiOperation({ summary: 'Trigger indexing of all annotations' })
  indexAnnotations() {
    return this.knowledgeBaseService.indexAllAnnotations();
  }

  @HttpCode(201)
  @Post('metric')
  @ApiOperation({ summary: 'Create a metric entry' })
  @ApiCreatedResponse({ description: 'Metric created' })
  createMetric(@Body() body: CreateMetricDto) {
    return this.knowledgeBaseService.createMetric(body);
  }
}
