import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from '@nestjs/typeorm';
import {
  EventEntity,
  EventMessageEntity,
  NetworkEntity,
  ProcessedBlockEntity,
} from '../entities/index.js';

@Injectable()
export class DatabaseTestConfigService implements TypeOrmOptionsFactory {
  constructor(private readonly configService: ConfigService) {}

  createTypeOrmOptions(): TypeOrmModuleOptions {
    return {
      type: 'postgres',
      host: this.configService.get('db.host'),
      port: this.configService.get('db.port'),
      username: this.configService.get('db.user_name'),
      database: this.configService.get('db.name_test'),
      password: this.configService.get('db.password'),
      entities: [
        EventEntity,
        EventMessageEntity,
        NetworkEntity,
        ProcessedBlockEntity,
      ],
      synchronize: true,
      keepConnectionAlive: true,
    };
  }
}
