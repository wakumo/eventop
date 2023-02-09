import { MigrationInterface, QueryRunner } from "typeorm";

export class AddScanRangeNoToNetworks1675929508123 implements MigrationInterface {
  name = 'AddScanRangeNoToNetworks1675929508123'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "networks" ADD "scan_range_no" smallint NOT NULL DEFAULT '50'`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "networks" DROP COLUMN "scan_range_no"`);
  }
}
