/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('salary_entries', function(table) {
    table.increments('id').primary();
    table.integer('employee_id').unsigned().notNullable();
    table.decimal('base_salary').notNullable();
    table.decimal('bonus').defaultTo(0);
    table.decimal('deductions').defaultTo(0);
    table.decimal('total_amount').notNullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());

    table.foreign('employee_id').references('id').inTable('employees').onDelete('CASCADE');
  });
};



/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */


exports.down = function(knex) {
  return knex.schema.dropTable('salary_entries');
};
