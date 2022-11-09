import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service.js';
import { HealthCheckService, HealthCheck, TypeOrmHealthIndicator } from '@nestjs/terminus';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private healthCheckService: HealthCheckService,
    private typeOrmHealthIndicator: TypeOrmHealthIndicator) { }

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('/healthz')
  @HealthCheck()
  async check() {
    const pingCheck = await this.typeOrmHealthIndicator.pingCheck('db')

    return { status: pingCheck.db?.status === 'up' }
  }
}
