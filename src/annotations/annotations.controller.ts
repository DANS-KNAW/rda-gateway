import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { AnnotationsService } from './annotations.service';
import { CreateAnnotationDto } from './dto/create-annotation.dto';
import { ApiKeyGuard } from 'src/guards/api-key/api-key.guard';

@Controller('annotations')
export class AnnotationsController {
  constructor(private readonly annotationsService: AnnotationsService) {}

  @UseGuards(ApiKeyGuard)
  @Post()
  createAnnotation(@Body() createAnnotationDto: CreateAnnotationDto) {
    // return this.annotationsService.createAnnotation(createAnnotationDto);
    return "Test"
  }
}
