import { Module } from '@nestjs/common';
import { NetworkService } from './network.service.js';

@Module({
  providers: [NetworkService]
})
export class NetworkModule {}
