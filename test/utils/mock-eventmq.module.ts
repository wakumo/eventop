import { AmqpConnection, RabbitMQModule } from "@golevelup/nestjs-rabbitmq";
import { Global, Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { RabbitMqConfigService } from "../../src/config/rabbitmq.config";
import { EventMqProducer } from "../../src/rabbitmq/services/eventmq-producer.service.js";

@Global()
@Module({
  imports: [
    RabbitMQModule.forRootAsync(RabbitMQModule, {
      imports: [ConfigModule],
      useClass: RabbitMqConfigService
    })
  ],
  providers: [EventMqProducer, AmqpConnection],
  exports: [EventMqProducer]
})
export class EventMqMockModule { }

jest.mock("../../src/rabbitmq/eventmq-job.module.js", () => EventMqMockModule)
