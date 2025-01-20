import {
  Controller,
  Post,
  Get,
  Put,
  Body,
  Param,
  UseGuards,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { KycService } from './kyc.service';
import { SubmitKycDto } from './dto/submit-kyc.dto';
import { UpdateKycDto } from './dto/update-kyc.dto';
import { KycStatusDto } from './dto/kyc-status.dto';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { JwtAuthGuard } from '../auth/strategy/jwt-auth.guard';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import * as cloudinary from 'cloudinary';
import * as uuid from 'uuid';
import * as path from 'path';
import { memoryStorage } from 'multer';

cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

@ApiTags('KYC')
@Controller('kyc')
@UseGuards(JwtAuthGuard)
export class KycController {
  constructor(private readonly kycService: KycService) {}

  @Post('submit')
  @ApiOperation({ summary: 'Submit KYC' })
  @ApiResponse({ status: 201, description: 'KYC submitted successfully.' })
  @ApiResponse({ status: 400, description: 'Invalid input.' })
  @ApiBody({ type: SubmitKycDto })
  @ApiBearerAuth()
  @UseInterceptors(
    FileInterceptor('document', {
      storage: memoryStorage(),
    }),
  )
  async submitKyc(
    @Body() submitKycDto: SubmitKycDto,
    @UploadedFile() file: Express.Multer.File,
    @GetUser() user: any,
  ) {
    if (file) {
      const fileName = `${uuid.v4()}${path.extname(file.originalname)}`;

      const base64String = file.buffer.toString('base64');
      const dataURI = `data:${file.mimetype};base64,${base64String}`;

      const uploadResult = await cloudinary.v2.uploader.upload(dataURI, {
        public_id: fileName,
        resource_type: 'auto',
      });

      submitKycDto.documentUrl = uploadResult.secure_url;
    }

    return this.kycService.submitKyc(submitKycDto, user.email);
  }

  @Post('status')
  @ApiOperation({ summary: 'Get KYC Status' })
  @ApiResponse({ status: 200, description: 'KYC status fetched successfully.' })
  @ApiResponse({ status: 404, description: 'KYC not found for this user.' })
  @ApiBearerAuth()
  async getKycStatus(@Body() kycStatusDto: KycStatusDto) {
    return this.kycService.getKycStatus(kycStatusDto);
  }

  @Put('update/:id')
  @ApiOperation({ summary: 'Update KYC by ID' })
  @ApiResponse({ status: 200, description: 'KYC updated successfully.' })
  @ApiResponse({ status: 404, description: 'KYC entry not found.' })
  @ApiBearerAuth()
  async updateKyc(@Param('id') id: number, @Body() updateKycDto: UpdateKycDto) {
    return this.kycService.updateKyc(id, updateKycDto);
  }

  @Get('submissions')
  @ApiOperation({ summary: 'Get all KYC submissions' })
  @ApiResponse({ status: 200, description: 'List of all KYC submissions.' })
  @ApiBearerAuth()
  async getAllKycSubmissions() {
    return this.kycService.getAllKycs();
  }
}
