import { Exclude, Expose } from 'class-transformer';
import { EventMessageStatus } from '../commons/enums/event_message_status.enum.js';
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  Relation,
} from 'typeorm';
import { EventEntity } from './index.js';

@Entity('event_messages')
@Index('idx_event_messages_delivered_msges', ['status', 'updated_at'])
export class EventMessageEntity extends BaseEntity {
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  id: number;

  @Column({ type: 'text', nullable: true })
  payload: string;

  @Index()
  @Column()
  tx_id: string;

  @Index()
  @Column()
  log_index: number;

  @Index()
  @Column({ type: 'bigint' })
  event_id: number;

  @Index('idx_event_messages_on_block_no')
  @Column({ type: 'bigint' })
  block_no: number;

  @Index()
  @Column()
  contract_address: string;

  @ManyToOne(() => EventEntity, (event) => event.event_messages, {
    nullable: true,
  })
  @JoinColumn({ name: 'event_id' })
  event: Relation<EventEntity>;

  @Index()
  @Column({
    type: 'enum',
    enum: EventMessageStatus,
    default: EventMessageStatus.PENDING,
  })
  status: EventMessageStatus;

  @Expose()
  @CreateDateColumn()
  created_at: Date;

  @Exclude()
  @UpdateDateColumn()
  updated_at: Date;
}
