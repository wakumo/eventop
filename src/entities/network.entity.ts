import { Exclude, Expose } from 'class-transformer';
import {
  BaseEntity,
  BeforeInsert,
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { EventEntity } from './event.entity';

@Entity('networks')
export class NetworkEntity extends BaseEntity {
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  id: number;

  @Index({ unique: true })
  @Column()
  name: string;

  @Index({ unique: true })
  @Column({ nullable: true })
  chain_id: number;

  @Exclude()
  @Column({ nullable: true })
  http_url: string;

  @Exclude()
  @Column({ nullable: true })
  wss_url: string;

  @Column({ nullable: true })
  tx_link: string;

  @Column({ nullable: true })
  address_link: string;

  @OneToMany(() => EventEntity, (event) => event.chain_id, { nullable: true })
  @JoinColumn({ name: 'chain_id', referencedColumnName: 'chain_id' })
  events: EventEntity;

  @Expose()
  @CreateDateColumn()
  created_at: Date;

  @Exclude()
  @UpdateDateColumn()
  updated_at: Date;

  @BeforeInsert()
  networkNameToLowerCase() {
    this.name = this.name?.toLowerCase();
  }
}
