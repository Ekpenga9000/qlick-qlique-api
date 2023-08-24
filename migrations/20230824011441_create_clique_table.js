/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
    return knex.schema
        .createTable('clique', (table) => {
        table.increments('id').primary();
        table.string('name').notNullable();
        table.text('description').notNullable();
        table.string('category').notNullable();
        table.string('banner_url').notNullable();    
        table.integer('user_id').unsigned().notNullable();    
        table.timestamp('created_at').defaultTo(knex.fn.now());
        table.timestamp('updated_at').defaultTo(knex.fn.now());
        table
          .foreign('user_id')
          .references('id') 
          .inTable('user') 
          .onUpdate('CASCADE')
          .onDelete('CASCADE');
      });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
    return knex.schema.dropTable('clique');
};
