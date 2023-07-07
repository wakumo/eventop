import { Module } from '@nestjs/common';
import { EventMessageService } from '../event-message/event-message.service.js';
import { EventsService } from '../events/events.service.js';
import { ProcessedBlockService } from './processed-block.service.js';
import { NetworkService } from '../network/network.service.js';

@Module({
  controllers: [],
  providers: [
    ProcessedBlockService,
    EventsService,
    EventMessageService,
    NetworkService,
  ],
  exports: [ProcessedBlockService],
})
export class ProcessedBlockModule {}
