const knex = require("knex");
const config = require("../knexfile");

const db = knex(config.development); // You can switch to .[process.env.NODE_ENV] later for environments

module.exports = db;
