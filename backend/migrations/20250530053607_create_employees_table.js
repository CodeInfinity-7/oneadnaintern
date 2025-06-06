
/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable('employees', (table) => {
    table.increments('id').primary();
    table
      .integer('business_id')
      .unsigned()
      .notNullable()
      .references('id')
      .inTable('businesses')
      .onDelete('CASCADE');
    table.string('full_name').notNullable();
    table.string('designation').notNullable();
    table.string('mobile').notNullable();
    table.string('email').notNullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTable('employees');
};


