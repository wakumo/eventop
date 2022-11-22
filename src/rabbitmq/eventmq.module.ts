import { AmqpConnection, RabbitMQModule } from '@golevelup/nestjs-rabbitmq';
import { Global, Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { RabbitMqConfigService } from "../config/rabbitmq.config.js";
import { EventMqProducer } from "./eventmq.producer.js";

@Global()
@Module({
  imports: [
    RabbitMQModule.forRootAsync(RabbitMQModule, {
      imports: [ConfigModule],
      useClass: RabbitMqConfigService
    })
  ],
  providers: [EventMqProducer],
  exports: [EventMqProducer]
})
export class EventMqModule { }