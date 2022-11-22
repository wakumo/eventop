import { Command, CommandRunner } from 'nest-commander';
import { EventsService } from '../../apis/events/events.service.js';
import { contractEvents } from './events/events.js';

@Command({ name: 'seed:events', description: 'Register contract events' })
export class EventSeed extends CommandRunner {
  constructor(private readonly eventService: EventsService) {
    super();
  }

  async run(): Promise<void> {
    for (const event of contractEvents) {
      for (const chainId of event.chain_ids) {
        console.log(`Registering event: ${event.name}, chain id: ${chainId}`);
        await this.eventService.registerEvent({
          chain_id: chainId,
          name: event.name,
          abi: event.abi,
          service_name: event.name,
        });
      }
    }
  }
}
