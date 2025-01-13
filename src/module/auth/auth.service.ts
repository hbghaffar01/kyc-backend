import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
  Request,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import {
  RegisterDto,
  registerSchema,
  LoginDto,
  loginSchema,
} from './schemas/auth.schema';

import { z } from 'zod';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async register(data: RegisterDto) {
    const validatedData = this.validateSchema(data, registerSchema);

    const existingUser = await this.userRepository.findOne({
      where: { email: validatedData.email },
    });

    if (existingUser) {
      throw new BadRequestException('Email is already in use');
    }

    const hashedPassword = await bcrypt.hash(validatedData.password, 10);

    const user = this.userRepository.create({
      email: validatedData.email,
      password: hashedPassword,
      firstName: validatedData.firstName,
      lastName: validatedData.lastName,
      role: validatedData.role || 'user',
    });

    await this.userRepository.save(user);

    const accessToken = this.generateToken(user);
    const refreshToken = await this.generateRefreshToken(user);

    return {
      message: 'User registered successfully',
      accessToken,
      refreshToken,
      user: {
        email: user.email,
        name: `${user.firstName} ${user.lastName}`,
        role: user.role,
      },
    };
  }

  async login(data: LoginDto) {
    const validatedData = this.validateSchema(data, loginSchema);

    const user = await this.userRepository.findOne({
      where: { email: validatedData.email },
    });

    if (
      !user ||
      !(await this.isPasswordValid(validatedData.password, user.password))
    ) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const accessToken = this.generateToken(user);
    const refreshToken = await this.generateRefreshToken(user);

    return {
      message: 'Login successful',
      accessToken,
      refreshToken,
      user: {
        email: user.email,
        name: `${user.firstName} ${user.lastName}`,
        role: user.role,
      },
    };
  }

  async logout(user: User) {
    if (!user || !user.email) {
      throw new UnauthorizedException('User not authenticated');
    }

    const existingUser = await this.userRepository.findOne({
      where: { email: user.email },
    });
    if (!existingUser) {
      throw new UnauthorizedException('User not found');
    }

    existingUser.refreshToken = null;
    await this.userRepository.save(existingUser);

    return { message: 'Successfully logged out' };
  }

  async refreshAccessToken(@Request() req: any) {
    const authHeader = req.headers['authorization'];

    if (!authHeader?.startsWith('Bearer ')) {
      throw new UnauthorizedException('Invalid authorization header format');
    }

    const refreshToken = authHeader.split(' ')[1];

    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token is missing');
    }

    try {
      const payload = await this.jwtService.verifyAsync(refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET,
      });
      const user = await this.userRepository.findOne({
        where: { email: payload.email },
      });

      if (!user || !user.refreshToken) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      const isValidRefreshToken = await bcrypt.compare(
        refreshToken,
        user.refreshToken,
      );

      if (!isValidRefreshToken) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      const accessToken = this.generateToken(user);

      return {
        accessToken,
      };
    } catch (error) {
      if (error.name === 'JsonWebTokenError') {
        throw new UnauthorizedException('Invalid refresh token format');
      } else if (error.name === 'TokenExpiredError') {
        throw new UnauthorizedException('Refresh token has expired');
      }
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async getProfile(userPayload: { email: string }) {
    const user = await this.userRepository.findOne({
      where: { email: userPayload.email },
      select: ['id', 'email', 'firstName', 'lastName', 'role', 'createdAt'],
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return {
      id: user.id,
      email: user.email,
      name: `${user.firstName} ${user.lastName}`,
      role: user.role,
      createdAt: user.createdAt,
    };
  }

  private validateSchema<T>(data: T, schema: z.ZodSchema<T>): T {
    try {
      return schema.parse(data);
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new BadRequestException({
          message: 'Validation failed',
          errors: error.errors.map((err) => ({
            field: err.path.join('.'),
            message: err.message,
          })),
        });
      }
      throw error;
    }
  }

  private async isPasswordValid(
    password: string,
    hashedPassword: string,
  ): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }

  private generateToken(user: User): string {
    return this.jwtService.sign(
      {
        email: user.email,
        name: `${user.firstName} ${user.lastName}`,
        role: user.role,
      },
      {
        secret: process.env.JWT_SECRET,
        expiresIn: '60m',
      },
    );
  }

  private async generateRefreshToken(user: User): Promise<string> {
    const refreshToken = this.jwtService.sign(
      { email: user.email, role: user.role },
      {
        secret: process.env.JWT_REFRESH_SECRET,
        expiresIn: '7d',
      },
    );
    const hashedToken = await bcrypt.hash(refreshToken, 10);
    user.refreshToken = hashedToken;
    await this.userRepository.save(user);

    return refreshToken;
  }
}
