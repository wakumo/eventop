import { RabbitRPC, RabbitSubscribe } from "@golevelup/nestjs-rabbitmq";
import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { ConsumeMessage, Channel } from 'amqplib'
import { EventMessageStatus } from "../../commons/enums/event_message_status.enum.js";
import { sleep } from "../../commons/utils/index.js";
import { RABBIT_MQ_MAX_BACKOFF, SECONDS_TO_MILLISECONDS } from "../../config/constants.js";
import { EventEntity, EventMessageEntity } from "../../entities/index.js";
import { EventMqProducer } from "./eventmq-producer.service.js";

function errorHandler(channel: Channel, msg: ConsumeMessage, error: Error) {
  console.log("this is error handler");
  console.log(error);
  channel.reject(msg, false);
}

@Injectable()
export class EventMqConsumer {
  constructor(
    private readonly producer: EventMqProducer
  ) { }

  @RabbitSubscribe({
    exchange: `${process.env.RABBITMQ_EXCHANGE_NAME}-dlx`,
    routingKey: "avacuscc.deadletter.events.*.*",
    queue: "event-mq-dlx-worker",
    queueOptions: {
      durable: true
    },
    errorHandler: errorHandler
  })
  public async handleEventDeadLetters(msg: any, amqpMsg: ConsumeMessage): Promise<void> {
    const xDeath = amqpMsg.properties.headers["x-death"];
    const xRetryCount = amqpMsg.properties.headers["x-retry-count"] ?? 0;
    console.log(`DEAD MESSAGE ARRIVED. MSG_ID: ${msg.id}, RETRY_COUNT: ${xRetryCount}`);
    if (!xDeath || !xDeath.length) return; // not a dead message, we don't do anything
    if (xRetryCount >= 5) {
      const hasMessage = await EventMessageEntity.findOneBy({ id: msg.id });
      if (hasMessage) await EventMessageEntity.update({ id: msg.id }, { status: EventMessageStatus.ERROR });
      else {
        const event = await EventEntity.findOneBy({
          event_topic: msg.eventTopic,
          chain_id: msg.chainId,
        });
        if (!event) return; // no valid event in db, maybe not a valid message

        await EventMessageEntity.create({
          event_id: event.id,
          payload: msg.payload,
          tx_id: msg.txId,
          log_index: msg.logIndex,
          block_no: msg.blockNo,
          contract_address: msg.contractAddress,
          timestamp: msg.timestamp,
          status: EventMessageStatus.ERROR
        }).save();
      }

      return;
    }

    const payload = msg;
    const { exchange, "routing-keys": routingKeys } = xDeath[0];

    // exponential backoff retry in 10-20-40-80-... seconds with max 5 minutes wait
    const sleepTime = Math.min((2 ** xRetryCount) * (10 * SECONDS_TO_MILLISECONDS), RABBIT_MQ_MAX_BACKOFF)
    await sleep(sleepTime);

    this.producer.publish(exchange, routingKeys[0], payload, { headers: { ["x-retry-count"]: xRetryCount + 1 } });
    return;
  }
}
