import { MigrationInterface, QueryRunner } from "typeorm";

export class AddIndexForPendingMessagesQuery1733800800000 implements MigrationInterface {
    name = 'AddIndexForPendingMessagesQuery1733800800000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE INDEX "idx_event_messages_pending_order" ON "event_messages" ("status", "block_no", "log_index") WHERE "status" = 'pending'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."idx_event_messages_pending_order"`);
    }
}
