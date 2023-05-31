import { Command, CommandRunner, Option } from 'nest-commander';
import { sleep } from '../../commons/utils/index.js';
import { EventMessageService } from "../../apis/event-message/event-message.service.js";

@Command({
  name: 'job:delete_delivered_messages',
  description: 'Delete all delivered events message to avoig huge database size',
})
export class DeleteDeliveredMessages extends CommandRunner {
  constructor(
    private readonly messageService: EventMessageService
  ) {
    super();
  }

  async run(): Promise<void> {
    await this.messageService.deleteDeliveredMessage();
  }
}
