import { Controller, Get, Put, Param, Body, UseGuards } from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/strategy/jwt-auth.guard';
import { AdminGuard } from './guards/admin.guard';
import { ReviewKycDto } from './dto/review-kyc.dto';
import { GetUser } from '../auth/decorators/get-user.decorator';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { DashboardStatsDto } from './dto/dashboard-response.dto';

@ApiTags('Admin')
@Controller('admin')
@UseGuards(JwtAuthGuard, AdminGuard)
@ApiBearerAuth()
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('users')
  @ApiOperation({ summary: 'Get all users with KYC status' })
  @ApiResponse({
    status: 200,
    description: 'List of all users with their KYC status',
  })
  async getAllUsers() {
    return this.adminService.getAllUsers();
  }

  @Get('kyc/pending')
  @ApiOperation({ summary: 'Get pending KYC submissions' })
  @ApiResponse({
    status: 200,
    description: 'List of pending KYC submissions',
  })
  async getPendingKyc() {
    return this.adminService.getPendingKyc();
  }

  @Put('kyc/review/:id')
  @ApiOperation({ summary: 'Review KYC submission' })
  @ApiParam({ name: 'id', description: 'KYC submission ID' })
  @ApiBody({ type: ReviewKycDto })
  @ApiResponse({
    status: 200,
    description: 'KYC submission reviewed successfully',
  })
  async reviewKyc(
    @Param('id') id: string,
    @Body() reviewData: ReviewKycDto,
    @GetUser('email') adminEmail: string,
  ) {
    return this.adminService.reviewKyc(id, reviewData, adminEmail);
  }

  @Get('dashboard')
  @ApiOperation({ summary: 'Get dashboard statistics' })
  @ApiResponse({
    status: 200,
    description: 'Dashboard statistics',
    type: DashboardStatsDto,
  })
  async getDashboardStats() {
    return this.adminService.getDashboardStats();
  }
}
