import { CommandFactory } from 'nest-commander';
import { JobModule } from "./job.module.js";

const bootstrap = async () => {
  await CommandFactory.run(JobModule, ["warn", "error", "verbose"]);
};

bootstrap();
