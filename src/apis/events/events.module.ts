import { Module } from '@nestjs/common';
import { EventsService } from './events.service.js';
import { EventsInternalController } from './events-internal.controller.js';

@Module({
  controllers: [EventsInternalController],
  providers: [EventsService],
  exports: [EventsService]
})
export class EventsModule {}
