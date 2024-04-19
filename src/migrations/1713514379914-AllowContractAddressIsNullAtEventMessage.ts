import { MigrationInterface, QueryRunner } from "typeorm";

export class AllowContractAddressIsNullAtEventMessage1713514379914 implements MigrationInterface {
  name = 'AllowContractAddressIsNullAtEventMessage1713514379914'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "event_messages" ALTER COLUMN "contract_address" DROP NOT NULL`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "event_messages" ALTER COLUMN "contract_address" SET NOT NULL`);
  }
}
