import { MigrationInterface, QueryRunner } from "typeorm";

export class AddTimestampToEventMessages1703060437645 implements MigrationInterface {
  name = 'AddTimestampToEventMessages1703060437645'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "event_messages" ADD "timestamp" bigint`);
    await queryRunner.query(`CREATE INDEX "IDX_827135a519a77dd8b203be7676" ON "event_messages" ("timestamp") `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "public"."IDX_827135a519a77dd8b203be7676"`);
    await queryRunner.query(`ALTER TABLE "event_messages" DROP COLUMN "timestamp"`);
  }
}
