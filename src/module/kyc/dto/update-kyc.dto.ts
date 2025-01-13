import { IsString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateKycDto {
  @ApiProperty({
    description: 'The full name of the user',
    type: String,
    required: false,
  })
  @IsString()
  @IsOptional()
  readonly fullName?: string;

  @ApiProperty({
    description: 'The type of document (e.g., Passport, ID Card)',
    type: String,
    required: false,
  })
  @IsString()
  @IsOptional()
  readonly documentType?: string;

  @ApiProperty({
    description: 'The URL where the document is stored',
    type: String,
    required: false,
  })
  @IsString()
  @IsOptional()
  readonly documentUrl?: string;
}
