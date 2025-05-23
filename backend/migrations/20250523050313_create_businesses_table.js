/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */


/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */

exports.up = function(knex) {
  return knex.schema.createTable('businesses', function(table) {
    table.increments('id').primary();
    table.string('name', 100).notNullable();
    table.string('owner', 100).notNullable();
    table.string('email', 100);
    table.string('phone', 15);
    table.text('address');
    table.timestamp('created_at').defaultTo(knex.fn.now());
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('businesses');
};
