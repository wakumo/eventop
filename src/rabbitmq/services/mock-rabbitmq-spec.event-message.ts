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
      publish: jest.fn().mockImplementation(() => true),
      request: jest.fn().mockImplementation(() => true)
    }))
  })
})

export default {};
