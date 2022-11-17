import { CommandFactory } from 'nest-commander';
import { AppModule } from "../src/app.module.js";

const bootstrap = async () => {
  await CommandFactory.run(AppModule, ["warn", "error", "verbose"]);
};

bootstrap();
