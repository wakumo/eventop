import { MigrationInterface, QueryRunner } from "typeorm";

export class AddInputsHashToEvents1675054531339 implements MigrationInterface {
  name = 'AddInputsHashToEvents1675054531339'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "events" ADD "abi_inputs_hash" character varying`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "events" DROP COLUMN "abi_inputs_hash"`);
  }
}
