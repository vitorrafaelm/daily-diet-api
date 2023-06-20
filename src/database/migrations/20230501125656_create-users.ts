import { Knex } from 'knex'

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('users', (table) => {
    table.uuid('uuid').primary().notNullable()

    table.text('name').notNullable()
    table.text('username').notNullable()
    table.text('email').notNullable()

    table.text('password').notNullable()

    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now())
    table.timestamp('upadated_at')
  })
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable('users')
}
