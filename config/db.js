const { createPool } = require('mysql');

const pool = createPool({
    port: process.env.DB_PORT,
    host: process.env.DB_HOST,
    password: process.env.DB_PASSWORD,
    user: process.env.DB_USER,
    database: process.env.DB_DATABASE,
    connectionLimit: 10
});

module.exports = pool;