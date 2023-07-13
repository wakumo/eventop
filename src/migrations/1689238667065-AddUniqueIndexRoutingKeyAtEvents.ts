import { MigrationInterface, QueryRunner } from "typeorm";

export class AddUniqueIndexRoutingKeyAtEvents1689238667065 implements MigrationInterface {
  name = 'AddUniqueIndexRoutingKeyAtEvents1689238667065'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE UNIQUE INDEX "idx-unique-routingkey-events" ON "events" ("routing_key") `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "public"."idx-unique-routingkey-events"`);
  }

}
