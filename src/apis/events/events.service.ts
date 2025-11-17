import _ from 'lodash';
import { ChainTopicsInterface } from 'src/commons/interfaces/chain_topics.interface.js';
import { DataSource, QueryRunner } from 'typeorm';

import { Injectable, Logger } from '@nestjs/common';

import { getABIInputsHash, getTopicFromEvent } from '../../commons/utils/blockchain.js';
import { EventEntity } from '../../entities/index.js';
import { CreateEventDto } from './dto/create-event.dto';

@Injectable()
export class EventsService {
  constructor(
    private connection: DataSource,
  ) {}

  async findEventBy(
    chainId: number,
    serviceName: string,
    name: string,
    inputsHash: string
  ) {
    let queryParams = {
      chain_id: chainId,
      name: name,
      service_name: serviceName,
    }
    if (inputsHash) {
      queryParams['abi_inputs_hash'] = inputsHash;
    }

    return EventEntity.createQueryBuilder('event')
      .where(queryParams)
      .getOne();
  }

  /**
   * Registers an event in the database or updates its ABI inputs hash if it already exists.
   */
  async registerEvent(createEventDto: CreateEventDto) {
    const queryRunner = this.connection.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const eventTopic = getTopicFromEvent(createEventDto.name);
      const inputsHash = getABIInputsHash(createEventDto.abi);

      let event = await this.findEventBy(
        createEventDto.chain_id,
        createEventDto.service_name,
        createEventDto.name,
        inputsHash
      );

      if (event) {
        event = await this._updateEvent(event, inputsHash, createEventDto.routing_key, queryRunner);
      } else {
        event = await this._createEvent(eventTopic, inputsHash, createEventDto, queryRunner);
      }

      await queryRunner.commitTransaction();
      return event;
    } catch (error) {
      console.error(`Failed to register event: ${error.message}`, error);
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  private async _createEvent(
    eventTopic: string,
    inputsHash: string,
    createEventDto: CreateEventDto,
    queryRunner: QueryRunner
  ): Promise<EventEntity> {
    console.info(
      `Registering event: ${createEventDto.name}, chainId: ${createEventDto.chain_id}, service: ${createEventDto.service_name}, routingKey: ${createEventDto.routing_key}`
    );
    let event = EventEntity.create({
      event_topic: eventTopic,
      abi_inputs_hash: inputsHash,
      ...createEventDto,
    });
    return await queryRunner.manager.save(EventEntity, event);
  }

  private async _updateEvent(
    event: EventEntity,
    inputsHash: string,
    routingKey: string,
    queryRunner: QueryRunner
  ): Promise<EventEntity> {
    if (event.abi_inputs_hash === inputsHash && event.routing_key === routingKey) {
      return event;
    }

    console.info(
      `Updating event: ${event.name}, chainId: ${event.chain_id}, service: ${event.service_name}, routingKey: ${routingKey}`
    );

    event.abi_inputs_hash = inputsHash;
    event.routing_key = routingKey;
    return await queryRunner.manager.save(EventEntity, event);
  }

  async getTopicsByChainId(chainId: number) {
    try {
      const result = await EventEntity.createQueryBuilder('event')
        .select('ARRAY_AGG(event.event_topic) as topics')
        .where('event.chain_id = :chainId', { chainId: chainId })
        .andWhere('event.event_topic IS NOT NULL')
        .groupBy('event.chain_id')
        .getRawOne<ChainTopicsInterface>();

      if (!result) { return []; }

      return _.uniq(result.topics);
    } catch (error) {
      console.log(error);
    }
  }

  async getEventsByChain(chainId: number) {
    const events = await EventEntity.createQueryBuilder('event')
      .where('event.chain_id = :chainId', { chainId: chainId })
      .getMany();

    return events;
  }
}
