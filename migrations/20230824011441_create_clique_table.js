/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema
    .createTable("clique", (table) => {
      table.increments("id").primary();
      table.text("name");
      table.text("description").notNullable();
      table.string("category").notNullable();
      table.string("banner_url").notNullable();
      table.integer("user_id").unsigned().notNullable();
      table.timestamp("created_at").defaultTo(knex.fn.now());
      table.timestamp("updated_at").defaultTo(knex.fn.now());
      table
        .enu("status", ["Active", "Deactivated", "Deleted"])
        .defaultTo("Active");
      table
        .foreign("user_id")
        .references("id")
        .inTable("user")
        .onUpdate("CASCADE")
        .onDelete("CASCADE");
    })
    .then(() => {
      return knex.schema.raw(
        "ALTER TABLE clique CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci"
      );
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTable("clique");
};
