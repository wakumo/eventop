import { Module } from '@nestjs/common'

@Module({})
class MockModule {
}

jest.mock('@golevelup/nestjs-rabbitmq', () => {
  const originalModule = jest.requireActual('@golevelup/nestjs-rabbitmq')

  return Object.assign(originalModule, {
    RabbitMQModule: {
      forRootAsync: jest.fn(() => MockModule),
    },
    AmqpConnection: jest.fn().mockImplementation(() => ({
      publish: jest.fn().mockImplementation(() => { console.log("Message published via RabbitMQ mocks") }),
      request: jest.fn().mockImplementation(() => {
        console.log("Message requested via RabbitMQ mocks");
        return true;
      })
    }))
  })
})

export default {};