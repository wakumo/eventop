import { MigrationInterface, QueryRunner } from "typeorm";

export class AddLogIndexToMessage1668480731641 implements MigrationInterface {
  name = 'AddLogIndexToMessage1668480731641'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "public"."idx_event_messages_uniq_msg"`);
    await queryRunner.query(`ALTER TABLE "event_messages" ADD "log_index" integer NOT NULL`);
    await queryRunner.query(`CREATE INDEX "IDX_b45e73d53abcd641c91b6f7178" ON "event_messages" ("log_index") `);
    await queryRunner.query(`CREATE UNIQUE INDEX "idx_event_messages_uniq_msg" ON "event_messages" ("event_id", "tx_id", "log_index") `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "public"."idx_event_messages_uniq_msg"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_b45e73d53abcd641c91b6f7178"`);
    await queryRunner.query(`ALTER TABLE "event_messages" DROP COLUMN "log_index"`);
    await queryRunner.query(`CREATE UNIQUE INDEX "idx_event_messages_uniq_msg" ON "event_messages" ("service_name", "tx_id", "event_id") `);
  }
}
