import { Injectable } from '@nestjs/common';
import { getTopicFromEvent } from '../../commons/utils/blockchain.js';
import { EventEntity } from '../../entities/index.js';
import { DataSource } from 'typeorm';
import { CreateEventDto } from './dto/create-event.dto';
import { ChainTopicsInterface } from 'src/commons/interfaces/chain_topics.interface.js';

@Injectable()
export class EventsService {
  constructor(private connection: DataSource) {}

  async registerEvent(createEventDto: CreateEventDto) {
    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();
    try {
      const eventTopic = getTopicFromEvent(createEventDto.name);
      let event: EventEntity;
      event = await EventEntity.findOne({
        where: {
          chain_id: createEventDto.chain_id,
          event_topic: eventTopic,
          service_name: createEventDto.service_name,
        },
      });
      if (event) { return; }

      event = EventEntity.create({
        event_topic: eventTopic,
        ...createEventDto,
      });
      event = await queryRunner.manager.save(EventEntity, event);
      return event;
    } catch (error) {
      console.log(error);
    } finally {
      await queryRunner.release();
    }
  }

  async getTopicsByChainId(chainId: number) {
    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();

    try {
      const result = await EventEntity.createQueryBuilder('event')
        .select('ARRAY_AGG(event.event_topic) as topics')
        .where('event.chain_id = :chainId', { chainId: chainId })
        .groupBy('event.chain_id')
        .getRawOne<ChainTopicsInterface>();

      if (!result) {
        return [];
      }
      return result.topics;
    } catch (error) {
      console.log(error);
    } finally {
      await queryRunner.release();
    }
  }

  async getEventsByChain(chainId: number) {
    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();

    try {
      const events = await EventEntity.createQueryBuilder('event')
        .where('event.chain_id = :chainId', { chainId: chainId })
        .getMany();

      return events;
    } catch (error) {
      console.log(error);
    } finally {
      await queryRunner.release();
    }
  }
}
