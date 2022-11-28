import { MigrationInterface, QueryRunner } from "typeorm";

export class EventMessageEntityAddErrorStatus1669370372206 implements MigrationInterface {
    name = 'EventMessageEntityAddErrorStatus1669370372206'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TYPE "public"."event_messages_status_enum" RENAME TO "event_messages_status_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."event_messages_status_enum" AS ENUM('pending', 'delivered', 'error')`);
        await queryRunner.query(`ALTER TABLE "event_messages" ALTER COLUMN "status" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "event_messages" ALTER COLUMN "status" TYPE "public"."event_messages_status_enum" USING "status"::"text"::"public"."event_messages_status_enum"`);
        await queryRunner.query(`ALTER TABLE "event_messages" ALTER COLUMN "status" SET DEFAULT 'pending'`);
        await queryRunner.query(`DROP TYPE "public"."event_messages_status_enum_old"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."event_messages_status_enum_old" AS ENUM('pending', 'delivered')`);
        await queryRunner.query(`ALTER TABLE "event_messages" ALTER COLUMN "status" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "event_messages" ALTER COLUMN "status" TYPE "public"."event_messages_status_enum_old" USING "status"::"text"::"public"."event_messages_status_enum_old"`);
        await queryRunner.query(`ALTER TABLE "event_messages" ALTER COLUMN "status" SET DEFAULT 'pending'`);
        await queryRunner.query(`DROP TYPE "public"."event_messages_status_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."event_messages_status_enum_old" RENAME TO "event_messages_status_enum"`);
    }

}
