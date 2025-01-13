import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('App')
@Controller()
export class AppController {
  @Get('health-check')
  @ApiOperation({ summary: 'Health check for the API' })
  @ApiResponse({ status: 200, description: 'API is up and running.' })
  getHealthCheck() {
    return { status: 'success', message: 'API is up and running' };
  }
}
