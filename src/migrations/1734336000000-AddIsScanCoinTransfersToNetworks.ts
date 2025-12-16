import { MigrationInterface, QueryRunner } from "typeorm";

export class AddIsScanCoinTransfersToNetworks1734336000000 implements MigrationInterface {
    name = 'AddIsScanCoinTransfersToNetworks1734336000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "networks" ADD "is_scan_coin_transfers" boolean NOT NULL DEFAULT true`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "networks" DROP COLUMN "is_scan_coin_transfers"`);
    }
}
