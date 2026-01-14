import { Exclude } from 'class-transformer';
import {
  BaseEntity,
  Column,
  UpdateDateColumn,
  Entity,
  Index,
  JoinColumn,
  PrimaryGeneratedColumn,
  Relation,
  OneToOne,
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

  @Column({ nullable: true })
  current_block_no: number;

  @OneToOne(() => NetworkEntity, (network) => network.chain_id)
  @JoinColumn({ name: 'chain_id', referencedColumnName: 'chain_id', foreignKeyConstraintName: 'fk_networks_processed_blocks' })
  network: Relation<NetworkEntity>;

  @Exclude()
  @UpdateDateColumn()
  updated_at: Date;
}
