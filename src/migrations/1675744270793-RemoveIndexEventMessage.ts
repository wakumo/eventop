import { MigrationInterface, QueryRunner } from "typeorm";

export class RemoveIndexEventMessage1675744270793 implements MigrationInterface {
  name = 'RemoveIndexEventMessage1675744270793'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "public"."idx_event_messages_uniq_msg"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE UNIQUE INDEX "idx_event_messages_uniq_msg" ON "event_messages" ("tx_id", "event_id", "log_index") `);
  }
}
