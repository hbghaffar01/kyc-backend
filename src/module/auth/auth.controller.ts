import {
  Controller,
  Post,
  Body,
  UseInterceptors,
  UseGuards,
  Request,
  Get,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto, LoginDto } from './schemas/auth.schema';
import { TransformInterceptor } from '../../common/interceptors/transform.interceptor';
import { JwtAuthGuard } from './strategy/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';

@ApiTags('Auth')
@Controller('auth')
@UseInterceptors(TransformInterceptor)
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({ status: 201, description: 'User  registered successfully.' })
  @ApiBody({ type: RegisterDto })
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async register(@Body() data: RegisterDto) {
    return this.authService.register(data);
  }

  @Post('login')
  @ApiOperation({ summary: 'Login a user and return a token' })
  @ApiResponse({ status: 200, description: 'Login successful, returns token.' })
  @ApiBody({ type: LoginDto })
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async login(@Body() data: LoginDto) {
    return this.authService.login(data);
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Logout user' })
  @ApiResponse({ status: 200, description: 'User  logged out successfully.' })
  async logout(@Request() req) {
    return this.authService.logout(req.user);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({
    status: 200,
    description: 'User  profile fetched successfully.',
  })
  async getProfile(@Request() req) {
    return this.authService.getProfile(req.user);
  }

  @Post('refresh-token')
  @ApiOperation({ summary: 'Refresh JWT token' })
  @ApiResponse({ status: 200, description: 'New access token generated.' })
  async refreshAccessToken(@Request() req: Request) {
    return this.authService.refreshAccessToken(req);
  }
}
