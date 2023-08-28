/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema
    .createTable('user', (table) => {
      table.increments('id').primary();
      table.string('firstname').notNullable();
      table.string('lastname').notNullable();
      table.string('email').notNullable().unique();
      table.string('phone_number').notNullable().unique();
      table.date('date_of_birth').notNullable();
      table.string('avatar_url').notNullable();
      table.string('username').notNullable().unique();
      table.string('password_hash').notNullable();
      table.text('bio');
      table.timestamp('created_at').defaultTo(knex.fn.now());
      table.timestamp('updated_at').defaultTo(knex.fn.now());
      table.timestamp('last_login').defaultTo(knex.fn.now());
      table.enu('status', ["Active", "Inactive","Blocked", "Deleted"]).defaultTo('Active');  
    })
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
    return knex.schema.dropTable('user');
};
