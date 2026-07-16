// Update with your config settings.

/**
 * @type { Object.<string, import("knex").Knex.Config> }
 */
module.exports = {

  development: {
  client: 'pg',
  connection: {
    host: '127.0.0.1',
    user: 'postgres',     
    password: 'Rmpm@2922',  
    database: 'Onepayslip',
    port: 2000
  },
  migrations: {
    directory: './migrations'
  }
},


  staging: {
    client: 'postgresql',
    connection: {
      database: 'my_db',
      user:     'username',
      password: 'password'
    },
    pool: {
      min: 2,
      max: 10
    },
    migrations: {
      tableName: 'knex_migrations'
    }
  },

production: {
  client: "pg",
  connection: process.env.DATABASE_URL,
  migrations: {
    directory: "./migrations"
  },
  ssl: {
    rejectUnauthorized: false
  }
}
  
};
