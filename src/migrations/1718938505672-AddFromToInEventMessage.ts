import { MigrationInterface, QueryRunner } from "typeorm";

export class AddFromToInEventMessage1718938505672 implements MigrationInterface {
    name = 'AddFromToInEventMessage1718938505672'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "event_messages" ADD "from" character varying`);
        await queryRunner.query(`ALTER TABLE "event_messages" ADD "to" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "event_messages" DROP COLUMN "to"`);
        await queryRunner.query(`ALTER TABLE "event_messages" DROP COLUMN "from"`);
    }

}
