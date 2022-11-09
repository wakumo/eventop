import { Command, CommandRunner, Option } from 'nest-commander';

interface UserJobOptions {
  name: string;
}

@Command({ name: 'job:hello', description: 'Say hello to user' })
export class SampleJob extends CommandRunner {
  constructor() {
    super();
  }

  async run(passedParam: string[], options?: UserJobOptions): Promise<void> {
    console.log(`Hello, ${options.name}, this is ${process.env.USER_NAME}`)
  }

  @Option({
    flags: '-n, --name [string]',
    description: 'Your name',
  })
  parseString(val: string): string {
    return val;
  }
}
