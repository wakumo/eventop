import { Exclude } from 'class-transformer';
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('processed_blocks')
@Index('idx_processed_blocks_uniq_block', ['chain_id', 'block_no'], {
  unique: true,
})
export class ProcessedBlockEntity extends BaseEntity {
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  id: number;

  @Index()
  @Column()
  block_no: number;

  @Index()
  @Column()
  chain_id: number;

  @Exclude()
  @CreateDateColumn()
  created_at: Date;
}
