import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { OrcidService } from './orcid.service';

@Module({
  imports: [HttpModule.register({ timeout: 5000 })],
  providers: [OrcidService],
  exports: [OrcidService],
})
export class OrcidModule {}
