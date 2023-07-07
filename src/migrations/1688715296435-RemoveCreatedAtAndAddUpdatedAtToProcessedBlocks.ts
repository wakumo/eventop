import { MigrationInterface, QueryRunner } from "typeorm";

export class RemoveCreatedAtAndAddUpdatedAtToProcessedBlocks1688715296435 implements MigrationInterface {
  name = 'RemoveCreatedAtAndAddUpdatedAtToProcessedBlocks1688715296435'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "processed_blocks" RENAME COLUMN "created_at" TO "updated_at"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "processed_blocks" RENAME COLUMN "updated_at" TO "created_at"`);
  }
}
