/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
// migrations/ensure_kyc_files.js
exports.up = function(knex) {
  return knex.schema.hasTable('kyc_files').then((exists) => {
    if (!exists) {
      // Don't run this in your case — Render will skip because table exists.
      return knex.schema.createTable('kyc_files', function(table) {
        table.increments('id').primary();
        table
          .integer('business_id')
          .unsigned()
          .references('id')
          .inTable('businesses')
          .onDelete('CASCADE');
        table.string('filename');
        table.string('filepath');
        table.string('mimetype');
        table.integer('size');
        table.timestamp('created_at').defaultTo(knex.fn.now());
      });
    }
  });
};




/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */

exports.down = function(knex) {
  return knex.schema.dropTableIfExists('kyc_files');
};