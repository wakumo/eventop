import { MigrationInterface, QueryRunner } from "typeorm";

export class AddRoutingKeyToEvents1685670661234 implements MigrationInterface {
  name = 'AddRoutingKeyToEvents1685670661234'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "events" ADD "routing_key" character varying`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "events" DROP COLUMN "routing_key"`);
  }
}
