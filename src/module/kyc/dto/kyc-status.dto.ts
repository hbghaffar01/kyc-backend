import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class KycStatusDto {
  @ApiProperty({
    description: 'The email address of the user to check KYC status',
    type: String,
  })
  @IsString()
  readonly email: string;
}
