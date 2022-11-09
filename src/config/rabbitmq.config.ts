import { ConfigService } from "@nestjs/config";

export async function rabbitMqConfigFactory(config: ConfigService) {
  return {
    exchanges: [
      {
        name: config.get('rabbitMq.exchanges.topic'),
        type: 'topic',
      },
    ],
    // new property
    handlers: {
      handler1: {
        exchange: config.get('rabbitMq.exchanges.topic'),
        routingKey: 'test.*',
        queue: config.get('rabbitMq.queues.payments.name'),
        queueOptions: config.get('rabbitMq.queues.payments.options'),
      },
    },
    uri: config.get('rabbitMq.host'),
  }
}