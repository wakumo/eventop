import { Test, TestingModule } from '@nestjs/testing';
import {
  getSynchronizeConnection,
  clearDB,
  IMPORT_MODULES,
} from '../../../test/utils.js';
import { EventMessageService } from './event-message.service';

describe('EventMessageService', () => {
  let service: EventMessageService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [...IMPORT_MODULES],
      providers: [EventMessageService],
    }).compile();

    service = module.get<EventMessageService>(EventMessageService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
