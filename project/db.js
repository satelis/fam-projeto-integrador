// conecta com o .env
require('dotenv').config({ path: '../.env' });
//conecta com o sql
const mysql = require('mysql2');

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

pool.getConnection((err, connection) => {
    if(err) {
        console.log("Erro ao conectar ao banco de dados: ", err.message);
        return;
    }
    console.log("Pool conectado ao Banco na Nuvem! ID: " + connection.threadId);
    pool.releaseConnection(connection);
});

module.exports = pool;