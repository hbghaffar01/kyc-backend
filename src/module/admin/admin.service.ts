import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../auth/entities/user.entity';
import { Kyc } from '../kyc/entities/kyc.entity';
import { ReviewKycDto } from './dto/review-kyc.dto';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Kyc)
    private readonly KycRepository: Repository<Kyc>,
  ) {}

  async getAllUsers() {
    return this.userRepository.find({
      relations: ['kycs'],
      select: ['id', 'email', 'role', 'createdAt'],
    });
  }

  async getPendingKyc() {
    return this.KycRepository.find({
      where: { status: 'PENDING' },
      relations: ['user'],
    });
  }

  async reviewKyc(kycId: string, reviewData: ReviewKycDto, adminEmail: string) {
    const kyc = await this.KycRepository.findOne({
      where: { id: parseInt(kycId, 10) },
      relations: ['user'],
    });

    if (!kyc) {
      throw new NotFoundException('KYC submission not found');
    }

    kyc.status = reviewData.status;
    kyc.reviewedBy = adminEmail;
    kyc.reviewedAt = new Date();

    if (reviewData.remarks) {
      kyc.remarks = reviewData.remarks;
    }

    return this.KycRepository.save(kyc);
  }

  async getDashboardStats() {
    const [totalUsers, pendingKyc, approvedKyc, rejectedKyc] =
      await Promise.all([
        this.userRepository.count(),
        this.KycRepository.count({ where: { status: 'PENDING' } }),
        this.KycRepository.count({ where: { status: 'APPROVED' } }),
        this.KycRepository.count({ where: { status: 'REJECTED' } }),
      ]);

    return {
      totalUsers,
      pendingKyc,
      approvedKyc,
      rejectedKyc,
    };
  }
}
