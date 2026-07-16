// Update with your config settings.

/**
 * @type { Object.<string, import("knex").Knex.Config> }
 */

module.exports = {
  development: {
    client: "pg",
    connection: {
      host: "127.0.0.1",
      user: "postgres",
      password: "Rmpm@2922",
      database: "Onepayslip",
      port: 2000,
    },
    migrations: {
      directory: "./migrations",
    },
  },

  staging: {
    client: "pg",
    connection: {
      connectionString: process.env.DATABASE_URL,
      ssl: {
        rejectUnauthorized: false,
      },
    },
    migrations: {
      directory: "./migrations",
    },
  },

  production: {
    client: "pg",
    connection: {
      connectionString: process.env.DATABASE_URL,
      ssl: {
        rejectUnauthorized: false,
      },
    },
    migrations: {
      directory: "./migrations",
    },
  },
};
