import { Knex } from 'knex'

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('meals', (table) => {
    table.uuid('uuid').primary().notNullable()

    table.uuid('user_id').unsigned().notNullable()
    table.foreign('user_id').references('userId').inTable('users')

    table.text('name').notNullable()
    table.text('description').notNullable()

    table.timestamp('meals_hour').notNullable()
    table.boolean('diet').notNullable()
  })
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable('users')
}
