import { Exclude, Expose } from 'class-transformer';
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  Relation,
  OneToOne,
} from 'typeorm';
import { EventEntity, ProcessedBlockEntity } from './index.js';

@Entity('networks')
export class NetworkEntity extends BaseEntity {
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  id: number;

  @Index({ unique: true })
  @Column()
  chain_id: number;

  @Exclude()
  @Column({ nullable: true })
  http_url: string;

  @Column({ type: 'varchar', array: true, default: [] })
  node_urls: string[];

  @Exclude()
  @Column({ nullable: true })
  wss_url: string;

  @Column({ nullable: true })
  tx_link: string;

  @Column({ nullable: true })
  address_link: string;

  @Column({ default: false })
  is_stop_scan: boolean;

  @Column({ default: 50, type: 'smallint' })
  scan_range_no: number;

  @OneToMany(() => EventEntity, (event) => event.chain_id, { nullable: true })
  @JoinColumn({ name: 'chain_id', referencedColumnName: 'chain_id' })
  events: Relation<EventEntity>[];

  @OneToOne(() => ProcessedBlockEntity, (processed_block) => processed_block.chain_id, { createForeignKeyConstraints: false })
  @JoinColumn({ name: 'chain_id', referencedColumnName: 'chain_id', foreignKeyConstraintName: 'fk_networks_processed_blocks' })
  processed_block: Relation<ProcessedBlockEntity>;

  @Expose()
  @CreateDateColumn()
  created_at: Date;

  @Exclude()
  @UpdateDateColumn()
  updated_at: Date;
}
