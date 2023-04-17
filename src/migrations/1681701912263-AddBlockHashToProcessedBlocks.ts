import { MigrationInterface, QueryRunner } from "typeorm";

export class AddBlockHashToProcessedBlocks1681701912263 implements MigrationInterface {
    name = 'AddBlockHashToProcessedBlocks1681701912263'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "processed_blocks" ADD "block_hash" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "processed_blocks" DROP COLUMN "block_hash"`);
    }

}
