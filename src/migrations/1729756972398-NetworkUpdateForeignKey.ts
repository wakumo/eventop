import { MigrationInterface, QueryRunner } from "typeorm";

export class NetworkUpdateForeignKey1729756972398 implements MigrationInterface {
  name = 'NetworkUpdateForeignKey1729756972398'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "processed_blocks" DROP CONSTRAINT "FK_f0d58cde6e152a924ee14020af9"`);
    await queryRunner.query(`DROP INDEX "public"."idx_processed_blocks_uniq_block"`);
    await queryRunner.query(`ALTER TABLE "processed_blocks" ADD CONSTRAINT "UQ_f0d58cde6e152a924ee14020af9" UNIQUE ("chain_id")`);
    await queryRunner.query(`CREATE UNIQUE INDEX "idx_processed_blocks_uniq_block" ON "processed_blocks" ("chain_id", "block_no") `);
    await queryRunner.query(`ALTER TABLE "processed_blocks" ADD CONSTRAINT "fk_networks_processed_blocks" FOREIGN KEY ("chain_id") REFERENCES "networks"("chain_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "processed_blocks" DROP CONSTRAINT "fk_networks_processed_blocks"`);
    await queryRunner.query(`DROP INDEX "public"."idx_processed_blocks_uniq_block"`);
    await queryRunner.query(`ALTER TABLE "processed_blocks" DROP CONSTRAINT "UQ_f0d58cde6e152a924ee14020af9"`);
    await queryRunner.query(`CREATE UNIQUE INDEX "idx_processed_blocks_uniq_block" ON "processed_blocks" ("block_no", "chain_id") `);
    await queryRunner.query(`ALTER TABLE "processed_blocks" ADD CONSTRAINT "FK_f0d58cde6e152a924ee14020af9" FOREIGN KEY ("chain_id") REFERENCES "networks"("chain_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
  }
}
