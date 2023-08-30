/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema
    .createTable("post", (table) => {
      table.increments("id").primary();
      table.text("content");
      table.string("image_url");
      table.integer("user_id").unsigned().notNullable();
      table.integer("clique_id").unsigned().notNullable();
      table.timestamp("created_by").notNullable().defaultTo(knex.fn.now());
      table.timestamp("updated_by").notNullable().defaultTo(knex.fn.now());
      table.enu("status", ["Active", "Deleted"]).defaultTo("Active");
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
    })
    .then(() => {
      return knex.schema.raw(
        "ALTER TABLE post CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci"
      );
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTable("post");
};
