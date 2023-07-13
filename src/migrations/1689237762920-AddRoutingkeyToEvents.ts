import { MigrationInterface, QueryRunner } from "typeorm";

export class AddRoutingkeyToEvents1689237762920 implements MigrationInterface {
  name = 'AddRoutingkeyToEvents1689237762920'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "events" ADD "routing_key" character varying`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "events" DROP COLUMN "routing_key"`);
  }

}
