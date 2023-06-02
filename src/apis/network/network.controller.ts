import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus
} from '@nestjs/common';
import { NetworkService } from './network.service.js';
// import { CreateNetworkDto } from './dto/create-network.dto';
// import { UpdateNetworkDto } from './dto/update-network.dto';

@Controller('internal/networks')
export class NetworkController {
  constructor(private readonly networkService: NetworkService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  async findAll() {
    return await this.networkService.findAll();
  }
}
