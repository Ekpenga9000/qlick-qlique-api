/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable("favourites", (table) => {
    table.increments("id").primary();
    table.integer("user_id").unsigned().notNullable();
    table.integer("clique_id").unsigned().notNullable();
    table.timestamp("updated_by").notNullable().defaultTo(knex.fn.now());
    table.enu("status", ["Added", "Removed"]).defaultTo("Added");
    table
      .foreign("user_id")
      .references("id")
      .inTable("user")
      .onUpdate("CASCADE")
      .onDelete("CASCADE");
    table
      .foreign("clique_id")
      .references("id")
      .inTable("clique")
      .onUpdate("CASCADE")
      .onDelete("CASCADE");
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTable("favourites");
};
