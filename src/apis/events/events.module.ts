import { Module } from '@nestjs/common';
import { EventsService } from './events.service';
import { EventsInternalController } from './events-internal.controller';

@Module({
  controllers: [EventsInternalController],
  providers: [EventsService]
})
export class EventsModule {}
