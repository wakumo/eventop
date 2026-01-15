import { Module } from '@nestjs/common';
import { NetworkService } from './network.service.js';
import { NetworkController } from './network.controller.js';
@Module({
  controllers: [NetworkController],
  providers: [NetworkService],
  exports: [NetworkService]
})
export class NetworkModule {}