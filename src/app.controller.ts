import { Controller, Get } from '@nestjs/common';
import {
  HealthCheckService,
  HealthCheck,
  TypeOrmHealthIndicator,
} from '@nestjs/terminus';

@Controller()
export class AppController {
  constructor(
    private health: HealthCheckService,
    private db: TypeOrmHealthIndicator,
  ) {}

  @Get('/healthz')
  @HealthCheck()
  async check() {
    const healthStatus = await this.health.check([
      () => this.db.pingCheck('database'),
    ]);

    return { status: healthStatus['status'] === 'ok' };
  }
}
