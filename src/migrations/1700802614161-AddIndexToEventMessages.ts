import { MigrationInterface, QueryRunner } from "typeorm";

export class AddIndexToEventMessages1700802614161 implements MigrationInterface {
    name = 'AddIndexToEventMessages1700802614161'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE INDEX "idx_event_messages_delivered_msges" ON "event_messages" ("status", "updated_at") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."idx_event_messages_delivered_msges"`);
    }

}
