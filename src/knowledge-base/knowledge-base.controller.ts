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

@Controller('knowledge-base')
export class KnowledgeBaseController {
  constructor(private readonly knowledgeBaseService: KnowledgeBaseService) {}

  @HttpCode(200)
  @Post(':index/_search')
  getAllDocuments(
    @Param('index') index: string,
    @Req() req: RawBodyRequest<Request>,
  ) {
    return this.knowledgeBaseService.getAllIndexDocuments(
      index,
      req.body as object,
    );
  }

  @Get(':index/_source/:document')
  getDocument(
    @Param('index') index: string,
    @Param('document') document: string,
  ) {
    return this.knowledgeBaseService.getDocument(index, document);
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
}
