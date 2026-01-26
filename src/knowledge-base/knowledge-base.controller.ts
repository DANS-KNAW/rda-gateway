import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { RawBodyRequest } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { KnowledgeBaseService } from './knowledge-base.service';
import { CreateAnnotationDto } from './dto/create-annotation.dto';
import { CreateMetricDto } from './dto/create-metric.dto';
import { Public } from '../common/decorators/public.decorator';
import { JwtAuthGuard } from '../iam/guards/jwt-auth.guard';
import { CurrentUser } from '../iam/decorators/current-user.decorator';

@ApiTags('Knowledge Base')
@Controller('knowledge-base')
export class KnowledgeBaseController {
  constructor(private readonly knowledgeBaseService: KnowledgeBaseService) {}

  @Public()
  @HttpCode(200)
  @Post('rda/_search')
  @ApiOperation({ summary: 'Search documents in the knowledge base' })
  getAllDocuments(@Req() req: RawBodyRequest<Request>) {
    return this.knowledgeBaseService.getAllIndexDocuments(req.body as object);
  }

  @Public()
  @Get('rda/_source/:document')
  @ApiOperation({ summary: 'Get a document by ID' })
  @ApiParam({ name: 'document', description: 'Document identifier' })
  getDocument(@Param('document') document: string) {
    return this.knowledgeBaseService.getDocument(document);
  }

  @UseGuards(JwtAuthGuard)
  @Post('/annotation')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create an annotation' })
  createAnnotation(
    @Body() body: CreateAnnotationDto,
    @CurrentUser('orcid') orcid: string,
  ) {
    return this.knowledgeBaseService.createAnnotation(body, orcid);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('/annotation/:id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete an annotation' })
  @ApiParam({ name: 'id', description: 'Annotation identifier' })
  deleteAnnotation(
    @Param('id') id: string,
    @CurrentUser('orcid') orcid: string,
  ) {
    return this.knowledgeBaseService.deleteAnnotation(id, orcid);
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

  @Public()
  @HttpCode(201)
  @Post('metric')
  @ApiOperation({ summary: 'Create a metric entry' })
  @ApiCreatedResponse({ description: 'Metric created' })
  createMetric(@Body() body: CreateMetricDto) {
    return this.knowledgeBaseService.createMetric(body);
  }
}
