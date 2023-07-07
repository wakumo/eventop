import { Module } from '@nestjs/common';
import { NetworkService } from './network.service';

@Module({
  providers: [NetworkService]
})
export class NetworkModule {}
