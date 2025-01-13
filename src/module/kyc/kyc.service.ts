import { Injectable, NotFoundException } from '@nestjs/common';
import { KycStatusDto } from './dto/kyc-status.dto';
import { Kyc } from './entities/kyc.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SubmitKycDto } from './dto/submit-kyc.dto';
import { UpdateKycDto } from './dto/update-kyc.dto';
import { User } from '../auth/entities/user.entity';

@Injectable()
export class KycService {
  constructor(
    @InjectRepository(Kyc)
    private kycRepository: Repository<Kyc>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async submitKyc(data: SubmitKycDto, userEmail: string): Promise<Kyc> {
    const user = await this.userRepository.findOne({
      where: { email: userEmail },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const kyc = this.kycRepository.create({
      ...data,
      user,
      userEmail,
    });

    return await this.kycRepository.save(kyc);
  }

  async getKycStatus(data: KycStatusDto): Promise<Kyc> {
    const kyc = await this.kycRepository.findOne({
      where: { userEmail: data.email },
    });

    if (!kyc) {
      throw new NotFoundException('KYC not found for this user');
    }

    return kyc;
  }

  async updateKyc(id: number, data: UpdateKycDto): Promise<Kyc> {
    const kyc = await this.kycRepository.findOne({
      where: { id },
    });

    if (!kyc) {
      throw new NotFoundException('KYC entry not found');
    }

    Object.assign(kyc, data);
    return this.kycRepository.save(kyc);
  }

  async getAllKycs(): Promise<Kyc[]> {
    return await this.kycRepository.find({ relations: ['user'] });
  }
}
