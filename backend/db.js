const { Pool } = require("pg");

const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "sistema_tickets",
  password: "P@ss-Saulo",
  port: 5432,
});

module.exports = pool;
