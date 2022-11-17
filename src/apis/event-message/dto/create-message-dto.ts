import { IsNotEmpty, IsOptional } from 'class-validator';

export class CreateMessageDto {
  @IsNotEmpty()
  event_id: string;

  @IsNotEmpty()
  payload: string;

  @IsNotEmpty()
  service_name: string;

  @IsNotEmpty()
  chain_id: number;

  @IsNotEmpty()
  tx_id: string;

  @IsOptional()
  block_no: string;

  @IsOptional()
  contract_address: string;
}
