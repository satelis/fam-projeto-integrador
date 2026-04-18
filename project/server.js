const express = require('express');
const cors = require ('cors');
const db = require('./db');
const app = express();

app.use(cors());
app.use(express.json());

//teste
app.get('/', (req, res) => {
    res.send("Servidor online.");
});

app.post('/usuarios', (req, res) => {
    const { username, senha } = req.body;
    const sql = "INSERT INTO usuarios (username, senha) VALUES (?, ?)";

    db.query(sql, [username, senha], (err, result) => {
        //tratando erro
        if (err) {
            return res.status(500).json({ erro: err.message });
        }
        //retorna id do user
        res.json({ mensagem: "Usuário criado.", id: result.insertId });
    });
});

app.listen(3000, () => {
    console.log("Servidor rodando em http://localhost:3000");
})