//conexao com o .env que está na pasta raiz
require('dotenv').config({ path: '../.env' });
console.log("Arquivo .env carregado? ", process.env.DB_USER ? "SIM" : NÃO);
console.log("arquivo lido", process.env.DB_USER);
//conexão com o banco de dados
const mysql = require('mysql2');

const connection = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME
});

connection.connect((err) => {
    if(err) {
        console.log("Erro ao conectar ao banco de dados: ", err.stack)
        return;
    }
    console.log("Conectado ao Banco como ID: " + connection.threadId);
});

module.exports = connection;