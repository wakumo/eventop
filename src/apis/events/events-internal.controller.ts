import {
  Controller,
  Post,
  Body,
  UseInterceptors,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { EventsService } from './events.service.js';
import { CreateEventDto } from './dto/create-event.dto.js';
import { SerializerInterceptor } from '../../commons/interceptors/index.js';

@UseInterceptors(SerializerInterceptor)
@Controller('internal/events')
export class EventsInternalController {
  constructor(private readonly eventsService: EventsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createEventDto: CreateEventDto) {
    return await this.eventsService.registerEvent(createEventDto);
  }
}
