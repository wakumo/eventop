import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';
import { Global, Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { RabbitMqConfigService } from "../config/rabbitmq.config.js";
import { EventMqConsumer } from "./services/eventmq-consumer.service.js";
import { EventMqProducer } from "./services/eventmq-producer.service.js";

@Global()
@Module({
  imports: [
    RabbitMQModule.forRootAsync(RabbitMQModule, {
      imports: [ConfigModule],
      useClass: RabbitMqConfigService
    }),
  ],
  providers: [EventMqProducer, EventMqConsumer],
  exports: [EventMqProducer]
})
export class EventMqAppModule { }