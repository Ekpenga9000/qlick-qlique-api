/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema.createTable("likes", (table) => {
        table.increments("like_id").primary();
        table.integer("user_id").unsigned().notNullable();
        table.integer("post_id").unsigned().notNullable();
        table.timestamp("update_on").notNullable().defaultTo(knex.fn.now());
        table.enu("status", ["Liked", "Unliked"]).defaultTo("Liked");
        table
            .foreign("user_id")
            .references("id")
            .inTable("user")
            .onUpdate("CASCADE")
            .onDelete("CASCADE");
        table
            .foreign("post_id")
            .references("id")
            .inTable("post")
            .onUpdate("CASCADE")
            .onDelete("CASCADE");
  })
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
    return knex.schema.dropTable("likes");
};
