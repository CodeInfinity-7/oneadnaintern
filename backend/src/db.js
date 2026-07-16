const knex = require("knex");
const config = require("../knexfile");

const environment = process.env.DATABASE_URL
  ? "production"
  : "development";

const db = knex(config[environment]);

module.exports = db;
