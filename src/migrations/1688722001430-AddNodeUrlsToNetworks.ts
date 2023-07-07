import { MigrationInterface, QueryRunner } from "typeorm";

export class AddNodeUrlsToNetworks1688722001430 implements MigrationInterface {
  name = 'AddNodeUrlsToNetworks1688722001430'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "networks" ADD "node_urls" character varying array NOT NULL DEFAULT '{}'`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "networks" DROP COLUMN "node_urls"`);
  }
}
