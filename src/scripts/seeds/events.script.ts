import * as Ajv from 'ajv';
import * as fs from 'fs';
import { Command, CommandRunner } from 'nest-commander';
import * as path from 'path';

import { EventsService } from '../../apis/events/events.service.js';
import { CacheManagerService } from '../../commons/cache-manager/cache-manager.service.js';

const eventSchema = {
  type: 'object',
  properties: {
    service_name: { type: 'string' },
    name: { type: 'string' },
    routing_key: { type: 'string' },
    abi: {
      anyOf: [
        { type: 'string' },
        { type: 'object' },
      ]
    },
    chain_ids: { type: 'array', items: { type: 'integer' } },
    contract_addresses: { type: 'array', items: { type: 'string' }, nullable: true }
  },
  required: ['name', 'chain_ids'],
  additionalProperties: false,
};

const ajv = new Ajv.default();
const validateEvent = ajv.compile(eventSchema);

@Command({ name: 'seed:events', description: 'Register contract events' })
export class EventSeed extends CommandRunner {

  private readonly EVENTS_FILE_PATH = process.env.EVENTS_FILE_PATH

  constructor(
    private readonly eventService: EventsService,
    private readonly cacheManager: CacheManagerService,
  ) {
    super();
  }

  async run(): Promise<void> {
    console.log(`Seeding events...`);
    const contractEvents = this.loadEventsFromFile(this.EVENTS_FILE_PATH);
    this.validateEvents(contractEvents);
    const chainIdsToClear = new Set<number>();

    for (const event of contractEvents) {
      for (const chainId of event.chain_ids) {
        let contractAddresses = [];
        if (event.contract_addresses) {
          contractAddresses = event.contract_addresses.map(contract => contract.toLowerCase());
        }
        const routingKey = event.routing_key ? event.routing_key : null;
        const abi = typeof event.abi === 'object' ? JSON.stringify(event.abi) : event.abi;

        const newEvent = await this.eventService.registerEvent({
          chain_id: chainId,
          name: event.name,
          abi: abi,
          service_name: event.service_name,
          contract_addresses: contractAddresses,
          routing_key: routingKey,
        });

        if (newEvent) {
          chainIdsToClear.add(chainId);
        }
      }
    }

    // Clear cache from all chain_ids
    for (const chainId of chainIdsToClear) {
      await this._clearCache(chainId);
    }
  }

  private loadEventsFromFile(filePath: string): any[] {
    const extname = path.extname(filePath);
    let fileContent: string;

    try {
      fileContent = fs.readFileSync(filePath, 'utf8');
    } catch (error) {
      throw new Error(`Failed to read file at ${filePath}: ${error.message}`);
    }

    if (extname !== '.json') {
      throw new Error(`Unsupported file extension: ${extname}. Use .json.`);
    }

    let data;
    try {
      data = JSON.parse(fileContent);
    } catch (error) {
      throw new Error(`Failed to parse JSON file at ${filePath}: ${error.message}`);
    }

    if (!Array.isArray(data)) {
      throw new Error(`Expected an array of events, but received ${typeof data}.`);
    }

    return data;
  }

  private validateEvents(events: any[]) {
    events.forEach((event) => {
      const valid = validateEvent(event);
      if (!valid) {
        throw new Error(`Invalid event data: ${ajv.errorsText(validateEvent.errors)}`);
      }
    });
  }

  private async _clearCache(chainId: number) {
    const clearedEventByChain = await this.cacheManager.delete(`EventsByChain.${chainId}`);
    console.info(`Cleared cache for EventsByChain.${chainId}: ${clearedEventByChain}`);
    const clearedTopicByChain = await this.cacheManager.delete(`TopicsByChainId.${chainId}`);
    console.info(`Cleared cache for TopicsByChainId.${chainId}: ${clearedTopicByChain}`);
  }
}
