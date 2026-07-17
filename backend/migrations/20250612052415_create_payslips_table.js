/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('payslips', function(table) {
    table.increments('id').primary();
    table.integer('employee_id').unsigned().notNullable().references('id').inTable('employees').onDelete('CASCADE');
    table.integer('salary_id').unsigned().notNullable().references('id').inTable('salary_entries').onDelete('CASCADE');
    table.string('pdf_url').notNullable(); // path or URL to the PDF
    table.string('qr_code').notNullable(); // HMAC token or secure hash
    table.timestamp('created_at').defaultTo(knex.fn.now());
  });
};



/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTableIfExists('payslips');
};
