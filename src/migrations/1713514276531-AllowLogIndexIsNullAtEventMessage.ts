import { MigrationInterface, QueryRunner } from "typeorm";

export class AllowLogIndexIsNullAtEventMessage1713514276531 implements MigrationInterface {
  name = 'AllowLogIndexIsNullAtEventMessage1713514276531'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "event_messages" ALTER COLUMN "log_index" DROP NOT NULL`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "event_messages" ALTER COLUMN "log_index" SET NOT NULL`);
  }

}
