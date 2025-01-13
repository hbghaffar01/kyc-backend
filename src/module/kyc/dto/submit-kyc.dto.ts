import { IsString, IsNotEmpty, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum KycStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

export enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
}

export class SubmitKycDto {
  @ApiProperty({
    description: 'The full name of the user',
    type: String,
  })
  @IsString()
  @IsNotEmpty()
  fullName: string;

  @ApiProperty({
    description: 'The type of document (e.g., Passport, ID Card)',
    type: String,
  })
  @IsString()
  @IsNotEmpty()
  documentType: string;

  @ApiProperty({
    description: 'The URL where the document is stored',
    type: String,
    required: false,
  })
  @IsString()
  @IsOptional()
  documentUrl?: string;

  @ApiProperty({
    description: 'The status of the KYC process',
    enum: KycStatus,
    default: KycStatus.PENDING,
    required: false,
  })
  @IsOptional()
  @IsEnum(KycStatus)
  status?: KycStatus;

  @ApiProperty({
    description: 'The role of the user',
    enum: UserRole,
  })
  @IsEnum(UserRole)
  @IsNotEmpty()
  role: UserRole;
}
