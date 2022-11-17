import { MigrationInterface, QueryRunner } from "typeorm";

export class RemoveNameAtNetworks1668571998217 implements MigrationInterface {
  name = 'RemoveNameAtNetworks1668571998217'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "public"."IDX_b340a763309cd7b7f7ab0d12a2"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_e01c2adc9b66fa9413620e3385"`);
    await queryRunner.query(`ALTER TABLE "networks" DROP COLUMN "name"`);
    await queryRunner.query(`ALTER TABLE "event_messages" DROP COLUMN "service_name"`);
    await queryRunner.query(`ALTER TABLE "processed_blocks" DROP CONSTRAINT "FK_f0d58cde6e152a924ee14020af9"`);
    await queryRunner.query(`ALTER TABLE "networks" ALTER COLUMN "chain_id" SET NOT NULL`);
    await queryRunner.query(`ALTER TABLE "processed_blocks" ADD CONSTRAINT "FK_f0d58cde6e152a924ee14020af9" FOREIGN KEY ("chain_id") REFERENCES "networks"("chain_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "processed_blocks" DROP CONSTRAINT "FK_f0d58cde6e152a924ee14020af9"`);
    await queryRunner.query(`ALTER TABLE "networks" ALTER COLUMN "chain_id" DROP NOT NULL`);
    await queryRunner.query(`ALTER TABLE "processed_blocks" ADD CONSTRAINT "FK_f0d58cde6e152a924ee14020af9" FOREIGN KEY ("chain_id") REFERENCES "networks"("chain_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    await queryRunner.query(`ALTER TABLE "event_messages" ADD "service_name" character varying NOT NULL`);
    await queryRunner.query(`ALTER TABLE "networks" ADD "name" character varying NOT NULL`);
    await queryRunner.query(`CREATE INDEX "IDX_e01c2adc9b66fa9413620e3385" ON "event_messages" ("service_name") `);
    await queryRunner.query(`CREATE UNIQUE INDEX "IDX_b340a763309cd7b7f7ab0d12a2" ON "networks" ("name") `);
  }
}
