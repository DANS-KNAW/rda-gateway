import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { AppService } from './app.service';
import { Public } from './common/decorators/public.decorator';

@ApiTags('Health')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Health check endpoint' })
  getHello(): string {
    return this.appService.getHello();
  }

  @Public()
  @Get('annotator')
  @ApiOperation({ summary: 'Get annotator information' })
  getAnnotator() {
    return this.appService.getAnnotator();
  }

  @Public()
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
