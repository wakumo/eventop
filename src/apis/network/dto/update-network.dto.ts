import { PartialType } from '@nestjs/mapped-types';
import { CreateNetworkDto } from './create-network.dto.js';

export class UpdateNetworkDto extends PartialType(CreateNetworkDto) {}