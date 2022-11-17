import { MigrationInterface, QueryRunner } from "typeorm";

export class AddContractAddressToEventMessages1668416395497 implements MigrationInterface {
    name = 'AddContractAddressToEventMessages1668416395497'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "event_messages" ADD "contract_address" character varying NOT NULL`);
        await queryRunner.query(`CREATE INDEX "IDX_9a85de35de6db322b59d001091" ON "event_messages" ("contract_address") `);
        await queryRunner.query(`ALTER TABLE "processed_blocks" ADD CONSTRAINT "FK_f0d58cde6e152a924ee14020af9" FOREIGN KEY ("chain_id") REFERENCES "networks"("chain_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "processed_blocks" DROP CONSTRAINT "FK_f0d58cde6e152a924ee14020af9"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_9a85de35de6db322b59d001091"`);
        await queryRunner.query(`ALTER TABLE "event_messages" DROP COLUMN "contract_address"`);
    }

}
