import { IsEmail, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { z } from 'zod';
import { Transform } from 'class-transformer';

export class RegisterDto {
  @ApiProperty({ description: 'First name of the user' })
  @IsNotEmpty()
  firstName: string;

  @ApiProperty({ description: 'Last name of the user' })
  @IsNotEmpty()
  lastName: string;

  @ApiProperty({ description: 'Email address of the user' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ description: 'Password of the user' })
  @IsNotEmpty({ message: 'Password must not be empty' })
  password: string;

  @ApiProperty({ description: 'Role of the user', required: true })
  @IsNotEmpty()
  @Transform(({ value }) => value.toLowerCase())
  role: string;
}

export class LoginDto {
  @ApiProperty({ description: 'Email address of the user' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ description: 'Password of the user' })
  @IsNotEmpty()
  password: string;
}

export const registerSchema = z.object({
  firstName: z.string().nonempty('First name is required'),
  lastName: z.string().nonempty('Last name is required'),
  email: z.string().email('Invalid email address'),
  role: z.string().optional().default('user'),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
});

export type RegisterDtoType = z.infer<typeof registerSchema>;
export type LoginDtoType = z.infer<typeof loginSchema>;
