import { MigrationInterface, QueryRunner } from "typeorm";

export class AddContractAddressesToEvents1674806146758 implements MigrationInterface {
    name = 'AddContractAddressesToEvents1674806146758'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "events" DROP COLUMN "contract_address"`);
        await queryRunner.query(`ALTER TABLE "events" ADD "contract_addresses" character varying(42) array NOT NULL DEFAULT '{}'`);
        await queryRunner.query(`CREATE INDEX "IDX_6a832d530a6ed344bd43fc583f" ON "events" ("contract_addresses") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_6a832d530a6ed344bd43fc583f"`);
        await queryRunner.query(`ALTER TABLE "events" DROP COLUMN "contract_addresses"`);
        await queryRunner.query(`ALTER TABLE "events" ADD "contract_address" character varying`);
    }
}
