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

//post de login

app.post('/login', (req, res) => {
    const { username, senha } = req.body;

    const sql = "SELECT id, username FROM usuarios WHERE username = ? AND senha = ?";

    db.query(sql, [username, senha], (err, results) => {
        if (err) {
            return res.status(500).json({ sucesso : false, mensagem: "Erro de banco"});
        }

        if (results.length > 0 ) {
            res.json({
                sucesso: true,
                id: results[0].id,
                username: results[0].username
            });
        } else {
            res.status(401).json ({ sucesso: false, mensagem: "Usuário ou senha incorretos."})
        }
    });
});

//post de cadastro
app.post('/cadastrar', (req, res) => {
    const { username, senha } = req.body;
    const sql = "INSERT INTO usuarios (username, senha) VALUES (?, ?)";

    db.query(sql, [username, senha], (err, result) => {
        //tratando erro
        if (err) {
            console.log("ERRO DO MYSQL:", err.message); // <-- O detetive entra aqui
            return res.status(500).json({ erro: err.message });
        }
        //retorna id do user
        res.json({ mensagem: "Usuário criado.", id: result.insertId });
    });
});

app.listen(3000, () => {
    console.log("Servidor rodando em http://localhost:3000");

})