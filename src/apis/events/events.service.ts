import { Injectable } from '@nestjs/common';
import { getTopicFromEvent } from '../../commons/utils/blockchain.js';
import { EventEntity } from '../../entities/index.js';
import { DataSource } from 'typeorm';
import { CreateEventDto } from './dto/create-event.dto';

@Injectable()
export class EventsService {
  constructor(private connection: DataSource) {}

  async registerEvent(createEventDto: CreateEventDto) {
    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();

    const eventTopic = getTopicFromEvent(createEventDto.name);
    let event = EventEntity.create({
      event_topic: eventTopic,
      ...createEventDto,
    });

    try {
      event = await queryRunner.manager.save(EventEntity, event);
      return event;
    } catch (error) {
      console.log(error);
    } finally {
      await queryRunner.release();
    }
  }
}
