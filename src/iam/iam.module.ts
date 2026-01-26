import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import iamConfig from '../config/iam.config';
import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    ConfigModule.forFeature(iamConfig),
  ],
  providers: [JwtStrategy],
  exports: [PassportModule],
})
export class IamModule {}
