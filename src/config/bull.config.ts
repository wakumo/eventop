import { BullModuleOptions, SharedBullConfigurationFactory } from "@nestjs/bull";
import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class BullConfigService implements SharedBullConfigurationFactory {
  constructor(private readonly configService: ConfigService) { }
  createSharedConfiguration(): BullModuleOptions {
    return {
      redis: {
        host: this.configService.get("redisHost"),
        port: this.configService.get("redisPort"),
        keyPrefix: "boilerplate:"
      },
    }
  }
}
