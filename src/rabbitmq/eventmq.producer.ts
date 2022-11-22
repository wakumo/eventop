import { AmqpConnection } from "@golevelup/nestjs-rabbitmq";
import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { RABBIT_MQ_TIMEOUT } from "../config/constants.js";

@Injectable()
export class EventMqProducer {
  constructor(
    private readonly rabbitmq: AmqpConnection,
    private readonly config: ConfigService
  ) { }

  publish(routingKey: string, payload: any): void {
    this.rabbitmq.publish(this.config.get("rabbitmq.exchange.name"), routingKey, payload);
  }

  request<T>(routingKey: string, payload: any): Promise<T> {
    return this.rabbitmq.request<T>({
      exchange: this.config.get("rabbitmq.exchange.name"),
      routingKey, payload,
      timeout: RABBIT_MQ_TIMEOUT
    })
  }
}