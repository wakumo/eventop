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
import { EventEntity } from './event.entity.js';

@Entity('event_messages')
@Index('idx_event_messages_uniq_msg', ['event_id', 'service_name', 'tx_id'], {
  unique: true,
})
export class EventMessageEntity extends BaseEntity {
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  id: number;

  @Column({ type: 'text', nullable: true })
  payload: string;

  @Index()
  @Column()
  service_name: string;

  @Index()
  @Column()
  tx_id: string;

  @Index()
  @Column({ type: 'bigint' })
  event_id: number;

  @Column({ type: 'bigint' })
  block_no: number;

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
