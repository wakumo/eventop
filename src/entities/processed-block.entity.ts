import { Exclude } from 'class-transformer';
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Relation,
} from 'typeorm';
import { NetworkEntity } from './network.entity.js';

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

  @Column({ nullable: true })
  block_hash: string;

  @ManyToOne(() => NetworkEntity, (network) => network.chain_id)
  @JoinColumn({ name: 'chain_id', referencedColumnName: 'chain_id' })
  network: Relation<NetworkEntity>;

  @Exclude()
  @CreateDateColumn()
  created_at: Date;
}
