// conecta com o .env
require('dotenv').config({ path: '../.env' });
//conecta com o sql
const mysql = require('mysql2');

const connection = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT
});

connection.connect((err) => {
    if(err) {
        console.log("Erro ao conectar ao banco de dados: ", err.message)
        return;
    }
    console.log("Conectado ao Banco na Nuvem! ID: " + connection.threadId);
});

module.exports = connection;