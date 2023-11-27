import { MigrationInterface, QueryRunner } from "typeorm";

export class AddBlockNoIndexAtEventMessages1701070067428 implements MigrationInterface {
  name = 'AddBlockNoIndexAtEventMessages1701070067428'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE INDEX "idx_event_messages_on_block_no" ON "event_messages" ("block_no") `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "public"."idx_event_messages_on_block_no"`);
  }
}
