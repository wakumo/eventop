import { Module } from '@nestjs/common';
import { EventMessageService } from './event-message.service.js';

@Module({
  providers: [EventMessageService],
  exports: [EventMessageService]
})
export class EventMessageModule {}
