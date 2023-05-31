import { Exclude, Expose } from 'class-transformer';
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  Relation,
} from 'typeorm';
import { EventMessageEntity } from './index.js';

@Entity('events')
@Index('idx_events_uniq_event', ['chain_id', 'event_topic', 'service_name', 'abi_inputs_hash'], {
  unique: true,
})
export class EventEntity extends BaseEntity {
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  id: number;

  // Only receive event from these contract addresses
  @Index()
  @Column({ type: 'varchar', array: true, length: 42, default: [] })
  contract_addresses: string[];

  @Index()
  @Column({ nullable: true })
  service_name: string;

  @Column()
  name: string;

  @Index()
  @Column()
  chain_id: number;

  @Index()
  @Column({ nullable: true })
  event_topic: string;

  @Column({ type: 'text', nullable: true })
  abi: string;

  @Column({ type: 'varchar', nullable: true })
  abi_inputs_hash: string;

  @OneToMany(() => EventMessageEntity, (message) => message.event, {
    nullable: true,
  })
  event_messages: Relation<EventEntity>[];

  @Expose()
  @CreateDateColumn()
  created_at: Date;

  @Exclude()
  @UpdateDateColumn()
  updated_at: Date;
}
