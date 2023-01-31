import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateIndexAtEvents1675067140149 implements MigrationInterface {
  name = 'UpdateIndexAtEvents1675067140149'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "public"."idx_events_uniq_event"`);
    await queryRunner.query(`CREATE UNIQUE INDEX "idx_events_uniq_event" ON "events" ("chain_id", "event_topic", "service_name", "abi_inputs_hash") `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "public"."idx_events_uniq_event"`);
    await queryRunner.query(`CREATE UNIQUE INDEX "idx_events_uniq_event" ON "events" ("service_name", "chain_id", "event_topic") `);
  }
}
