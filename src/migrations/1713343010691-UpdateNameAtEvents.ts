import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateNameAtEvents1713343010691 implements MigrationInterface {
  name = 'UpdateNameAtEvents1713343010691'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "events" ALTER COLUMN "name" DROP NOT NULL`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "events" ALTER COLUMN "name" SET NOT NULL`);
  }
}
