import { ApiProperty } from '@nestjs/swagger';
import { z } from 'zod';

export const ReviewKycSchema = z.object({
  status: z.enum(['APPROVED', 'REJECTED']),
  remarks: z.string().optional(),
});

export class ReviewKycDto {
  @ApiProperty({
    enum: ['APPROVED', 'REJECTED'],
    description: 'Status of KYC review',
  })
  status: 'APPROVED' | 'REJECTED';

  @ApiProperty({
    required: false,
    description: 'Remarks for the review decision',
  })
  remarks?: string;
}
