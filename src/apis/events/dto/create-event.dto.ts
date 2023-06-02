import { IsNotEmpty, IsOptional } from 'class-validator';

export class CreateEventDto {
  @IsNotEmpty()
  chain_id: number;

  @IsNotEmpty()
  name: string;

  @IsNotEmpty()
  abi: string;

  @IsNotEmpty()
  service_name: string;

  @IsNotEmpty()
  routing_key: string;

  @IsOptional()
  contract_addresses?: string[];
}
