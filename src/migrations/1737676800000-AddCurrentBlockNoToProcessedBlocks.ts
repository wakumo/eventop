import { MigrationInterface, QueryRunner } from "typeorm";

export class AddCurrentBlockNoToProcessedBlocks1737676800000 implements MigrationInterface {
    name = 'AddCurrentBlockNoToProcessedBlocks1737676800000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "processed_blocks" ADD "current_block_no" integer`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "processed_blocks" DROP COLUMN "current_block_no"`);
    }
}
