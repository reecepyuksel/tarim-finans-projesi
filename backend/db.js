const { Pool } = require("pg");

const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "tarim_finans_db",
  password: "recep190",
  port: 5432,
});
module.exports = pool;
