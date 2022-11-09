import { MigrationInterface, QueryRunner } from "typeorm";

export class InitDatabase1667988934519 implements MigrationInterface {
    name = 'InitDatabase1667988934519'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "processed_blocks" ("id" BIGSERIAL NOT NULL, "block_no" integer NOT NULL, "chain_id" integer NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_44f50a9c605aa191aee292a2a84" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_f338dc9ad6766445e2de436c50" ON "processed_blocks" ("block_no") `);
        await queryRunner.query(`CREATE INDEX "IDX_f0d58cde6e152a924ee14020af" ON "processed_blocks" ("chain_id") `);
        await queryRunner.query(`CREATE UNIQUE INDEX "idx_processed_blocks_uniq_block" ON "processed_blocks" ("chain_id", "block_no") `);
        await queryRunner.query(`CREATE TYPE "public"."event_messages_status_enum" AS ENUM('pending', 'delivered')`);
        await queryRunner.query(`CREATE TABLE "event_messages" ("id" BIGSERIAL NOT NULL, "payload" text, "service_name" character varying NOT NULL, "tx_id" character varying NOT NULL, "event_id" bigint NOT NULL, "block_no" bigint NOT NULL, "status" "public"."event_messages_status_enum" NOT NULL DEFAULT 'pending', "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_c7284d8b3497760777fc53e76b0" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_e01c2adc9b66fa9413620e3385" ON "event_messages" ("service_name") `);
        await queryRunner.query(`CREATE INDEX "IDX_e026499e0b44ed948ea30f38a6" ON "event_messages" ("tx_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_a0c503806e4e307c76b6d59e11" ON "event_messages" ("event_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_890d6dcd3ae3e7493425266c90" ON "event_messages" ("status") `);
        await queryRunner.query(`CREATE UNIQUE INDEX "idx_event_messages_uniq_msg" ON "event_messages" ("event_id", "service_name", "tx_id") `);
        await queryRunner.query(`CREATE TABLE "events" ("id" BIGSERIAL NOT NULL, "contract_address" character varying, "service_name" character varying, "name" character varying NOT NULL, "chain_id" integer NOT NULL, "event_topic" character varying, "abi" text, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_40731c7151fe4be3116e45ddf73" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_fb66875b9a047d714e9abcd66f" ON "events" ("service_name") `);
        await queryRunner.query(`CREATE INDEX "IDX_dc07144f506e45ab918c39c151" ON "events" ("chain_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_66432fdee016439df781f3f177" ON "events" ("event_topic") `);
        await queryRunner.query(`CREATE UNIQUE INDEX "idx_events_uniq_event" ON "events" ("chain_id", "event_topic", "service_name") `);
        await queryRunner.query(`CREATE TABLE "networks" ("id" BIGSERIAL NOT NULL, "name" character varying NOT NULL, "chain_id" integer, "http_url" character varying, "wss_url" character varying, "tx_link" character varying, "address_link" character varying, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_61b1ee921bf79550d9d4742b9f7" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_b340a763309cd7b7f7ab0d12a2" ON "networks" ("name") `);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_f23b9cf248e59b771fad5f313c" ON "networks" ("chain_id") `);
        await queryRunner.query(`ALTER TABLE "event_messages" ADD CONSTRAINT "FK_a0c503806e4e307c76b6d59e114" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "event_messages" DROP CONSTRAINT "FK_a0c503806e4e307c76b6d59e114"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_f23b9cf248e59b771fad5f313c"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_b340a763309cd7b7f7ab0d12a2"`);
        await queryRunner.query(`DROP TABLE "networks"`);
        await queryRunner.query(`DROP INDEX "public"."idx_events_uniq_event"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_66432fdee016439df781f3f177"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_dc07144f506e45ab918c39c151"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_fb66875b9a047d714e9abcd66f"`);
        await queryRunner.query(`DROP TABLE "events"`);
        await queryRunner.query(`DROP INDEX "public"."idx_event_messages_uniq_msg"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_890d6dcd3ae3e7493425266c90"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_a0c503806e4e307c76b6d59e11"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_e026499e0b44ed948ea30f38a6"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_e01c2adc9b66fa9413620e3385"`);
        await queryRunner.query(`DROP TABLE "event_messages"`);
        await queryRunner.query(`DROP TYPE "public"."event_messages_status_enum"`);
        await queryRunner.query(`DROP INDEX "public"."idx_processed_blocks_uniq_block"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_f0d58cde6e152a924ee14020af"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_f338dc9ad6766445e2de436c50"`);
        await queryRunner.query(`DROP TABLE "processed_blocks"`);
    }

}
