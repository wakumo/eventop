import {
  Command,
  CommandRunner,
  Option,
} from 'nest-commander';
import { EventsService } from '../../apis/events/events.service.js';
import { contractEvents as contractEventsDev } from './dev/events/events.js';
import { contractEvents as contractEventsProd } from './prod/events/events.js';
import { Env } from '../../commons/enums/index.js';
import { CacheManagerService } from '../../commons/cache-manager/cache-manager.service.js';

@Command({ name: 'seed:events', description: 'Register contract events' })
export class EventSeed extends CommandRunner {

  constructor(
    private readonly eventService: EventsService,
    private readonly cacheManager: CacheManagerService,
  ) {
    super();
  }

  async run(_: string[], options?: { env: Env }): Promise<void> {
    const { env } = options;
    console.log(`Seeding events for environment ${env}...`);
    const contractEvents = env === Env.DEV ? contractEventsDev : contractEventsProd;

    for (const event of contractEvents) {
      for (const chainId of event.chain_ids) {
        let contractAddresses = [];
        if (event.contract_addresses) {
          contractAddresses = event.contract_addresses.map(contract => {
            return contract.toLowerCase();
          });
        }
        const routingKey = event['routing_key'] ? event['routing_key'] : null;
        await this.eventService.registerEvent({
          chain_id: chainId,
          name: event.name,
          abi: event.abi,
          service_name: event.service_name,
          contract_addresses: contractAddresses,
          routing_key: routingKey,
        });
        await this._clearCache(chainId);
      }
    }
  }

  private async _clearCache(chainId: number) {
    const clearedEventByChain = await this.cacheManager.delete(`EventsByChain.${chainId}`);
    console.info(`Cleared cache for EventsByChain.${chainId}: ${clearedEventByChain}`);
    const clearedTopicByChain = await this.cacheManager.delete(`TopicsByChainId.${chainId}`);
    console.info(`Cleared cache for TopicsByChainId.${chainId}: ${clearedTopicByChain}`);
  }

  @Option({
    flags: '-e, --env [string]',
    description: 'Environment to seed events',
    required: true,
  })
  checkEnvironment(val: string): Env {
    if (!Object.values(Env).includes(val.toLowerCase() as Env)) throw new Error("Invalid environment. Must be one of dev, prod");
    return val.toLowerCase() as Env;
  }
}
