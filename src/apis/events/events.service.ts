import { Injectable } from '@nestjs/common';
import { getABIInputsHash, getTopicFromEvent } from '../../commons/utils/blockchain.js';
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

      // Two Transfered events can have same function signature (event_topic)
      // But ABI can be different due to indexes factor
      // therefore we need allow register two events same signature but different abi
      // inputsHash is used to detected abi structure is same or not
      const inputsHash = getABIInputsHash(createEventDto.abi);

      if (event) {
        // update inputs_hash if not exists
        if (!event.abi_inputs_hash) {
          event.abi_inputs_hash = inputsHash;
          await queryRunner.manager.save(EventEntity, event);
        }
        return;
      }

      event = EventEntity.create({
        event_topic: eventTopic,
        abi_inputs_hash: inputsHash,
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
    }
  }

  async getEventsByChain(chainId: number) {
    try {
      const events = await EventEntity.createQueryBuilder('event')
        .where('event.chain_id = :chainId', { chainId: chainId })
        .getMany();

      return events;
    } catch (error) {
      console.log(error);
    }
  }
}
