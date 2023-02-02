import { Command, CommandRunner } from 'nest-commander';
import { EventMessageService } from "../../apis/event-message/event-message.service.js";
import { sleep } from "../../commons/utils/index.js";
import { SECONDS_TO_MILLISECONDS } from "../../config/constants.js";

@Command({ name: 'job:send_events', description: 'Query and fire RabbitMQ message for pending events' })
export class SendEventsJob extends CommandRunner {
  constructor(
    private readonly eventMessageService: EventMessageService
  ) {
    super();
  }

  async run(): Promise<void> {
    while (true) {
      await this.eventMessageService.sendPendingMessages();
      await sleep(1 * SECONDS_TO_MILLISECONDS);
    }
  }
}
