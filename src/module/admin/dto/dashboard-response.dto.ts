import { ApiProperty } from '@nestjs/swagger';

export class DashboardStatsDto {
  @ApiProperty({ description: 'Total number of users' })
  totalUsers: number;

  @ApiProperty({ description: 'Number of pending KYC submissions' })
  pendingKyc: number;

  @ApiProperty({ description: 'Number of approved KYC submissions' })
  approvedKyc: number;

  @ApiProperty({ description: 'Number of rejected KYC submissions' })
  rejectedKyc: number;
}
