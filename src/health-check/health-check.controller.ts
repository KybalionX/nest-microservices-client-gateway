import { Controller, Get } from '@nestjs/common';

@Controller('/')
export class HealthCheckController {
  @Get()
  execute() {
    return 'Client Gateway is up and running!';
  }
}
