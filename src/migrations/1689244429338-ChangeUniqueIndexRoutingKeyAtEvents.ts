import { MigrationInterface, QueryRunner } from "typeorm";

export class ChangeUniqueIndexRoutingKeyAtEvents1689244429338 implements MigrationInterface {
  name = 'ChangeUniqueIndexRoutingKeyAtEvents1689244429338'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "public"."idx-unique-routingkey-events"`);
    await queryRunner.query(`CREATE UNIQUE INDEX "idx_events_uniq_routingkey_event" ON "events" ("chain_id", "routing_key", "service_name") `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "public"."idx_events_uniq_routingkey_event"`);
  }

}
