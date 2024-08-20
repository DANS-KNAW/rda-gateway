import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { AnnotationsService } from './annotations.service';
import { CreateAnnotationDto } from './dto/create-annotation.dto';
import { UpdateAnnotationDto } from './dto/update-annotation.dto';

@Controller('annotations')
export class AnnotationsController {
  constructor(private readonly annotationsService: AnnotationsService) {}

  @Post()
  createAnnotation(@Body() createAnnotationDto: CreateAnnotationDto) {
    return this.annotationsService.createAnnotation(createAnnotationDto);
  }
}
