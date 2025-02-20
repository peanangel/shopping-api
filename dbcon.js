const mysql = require('mysql');

const pool = mysql.createPool({
    connectionLimit: 10,
    host: 'localhost',
    user: 'mynode',
    password: 'mynode',
    database: 'shopping sell'
});

module.exports = pool;