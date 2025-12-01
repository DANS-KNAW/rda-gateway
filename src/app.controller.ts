import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { AppService } from './app.service';

@ApiTags('Health')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiOperation({ summary: 'Health check endpoint' })
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('annotator')
  @ApiOperation({ summary: 'Get annotator information' })
  getAnnotator() {
    return this.appService.getAnnotator();
  }

  @Get('annotator/min-version')
  @ApiOperation({ summary: 'Get minimum supported annotator version' })
  getAnnotatorMinVersion() {
    return this.appService.getAnnotatorMinVersion();
  }

  // @Post('annotator')
  // triggerAnnotatorCheck() {
  //   return this.appService.getLatestAnnotatorVersion();
  // }
}
