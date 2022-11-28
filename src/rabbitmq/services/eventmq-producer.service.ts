import { AmqpConnection } from "@golevelup/nestjs-rabbitmq";
import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Options } from "amqplib";
import { RABBIT_MQ_TIMEOUT } from "../../config/constants.js";

@Injectable()
export class EventMqProducer {
  constructor(
    private readonly rabbitmq: AmqpConnection,
    private readonly config: ConfigService
  ) { }

  publish(exchange: string, routingKey: string, payload: any, opts?: Options.Publish): void {
    if (!exchange) exchange = this.config.get("rabbitmq.exchange.name");
    this.rabbitmq.publish(exchange, routingKey, payload, opts);
  }

  request<T>(exchange: string, routingKey: string, payload: any, headers?: any): Promise<T> {
    if (!exchange) exchange = this.config.get("rabbitmq.exchange.name");
    return this.rabbitmq.request<T>({ exchange, routingKey, payload, headers, timeout: RABBIT_MQ_TIMEOUT })
  }
}