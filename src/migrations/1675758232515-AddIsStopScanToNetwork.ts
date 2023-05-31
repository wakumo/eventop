import { MigrationInterface, QueryRunner } from "typeorm";

export class AddIsStopScanToNetwork1675758232515 implements MigrationInterface {
  name = 'AddIsStopScanToNetwork1675758232515'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "networks" ADD "is_stop_scan" boolean NOT NULL DEFAULT false`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "networks" DROP COLUMN "is_stop_scan"`);
  }
}
