/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema
    .createTable("user", (table) => {
      table.increments("id").primary();
      table.string("google_id");
      table.string("firstname").notNullable();
      table.string("lastname").notNullable();
      table.string("email").notNullable().unique();
      table.string("phone_number").unique();
      table.date("date_of_birth");
      table.string("avatar_url");
      table.string('username').unique().notNullable();
      table.text('display_name');
      table.string("password_hash").notNullable();
      table.text("bio");
      table.timestamp("created_at").defaultTo(knex.fn.now());
      table.timestamp("updated_at").defaultTo(knex.fn.now());
      table.timestamp("last_login").defaultTo(knex.fn.now());
      table
        .enu("status", ["Active", "Inactive", "Blocked", "Deleted"])
        .defaultTo("Active");
    })
    .then(() => {
      return knex.schema.raw(
        "ALTER TABLE user CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci"
      );
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTable("user");
};
