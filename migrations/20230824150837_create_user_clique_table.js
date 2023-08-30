/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable("user_clique", (table) => {
    table.increments("id").primary();
    table.integer("user_id").unsigned().notNullable();
    table.integer("clique_id").unsigned().notNullable();
    table.enu("user_roles", ["Owner", "Guest"]).defaultTo("Guest");
    table.timestamp("joined_clique").defaultTo(knex.fn.now());
    table.enu("Status", ["Joined", "Left"]);
    table
      .foreign("user_id")
      .references("id")
      .inTable("user")
      .onUpdate("CASCADE")
      .onDelete("CASCADE");
    table
      .foreign("clique_id")
      .references("id")
      .inTable("user")
      .onUpdate("CASCADE")
      .onDelete("CASCADE");
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTable("user_clique");
};
