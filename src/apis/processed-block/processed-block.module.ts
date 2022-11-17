import { Module } from '@nestjs/common';
import { EventMessageService } from '../event-message/event-message.service.js';
import { EventsService } from '../events/events.service.js';
import { ProcessedBlockService } from './processed-block.service.js';

@Module({
  controllers: [],
  providers: [ProcessedBlockService, EventsService, EventMessageService],
  exports: [ProcessedBlockService],
})
export class ProcessedBlockModule {}
