import { Controller, Get } from '@nestjs/common';

@Controller('iam')
export class IamController {
  @Get()
  authenticate() {
    return { message: 'IAM authentication successful' };
  }
}
