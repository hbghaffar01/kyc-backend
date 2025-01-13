import { Module } from '@nestjs/common';
import { KycService } from './kyc.service';
import { KycController } from './kyc.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Kyc } from './entities/kyc.entity';
import { User } from '../auth/entities/user.entity'; // Import the User entity
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([Kyc, User]), AuthModule],
  providers: [KycService],
  controllers: [KycController],
})
export class KycModule {}
