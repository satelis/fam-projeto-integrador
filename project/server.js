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

//post de feeds (salvar review)
app.post('/reviews', (req, res) => {
    const { usuario_id, categoria, midia, imagem_url, nota, texto } = req.body;
    
    const sql = "INSERT INTO reviews (usuario_id, categoria, midia, imagem_url, nota, texto) VALUES (?, ?, ?, ?, ?, ?)";
    
    db.query(sql, [usuario_id, categoria, midia, imagem_url, nota, texto], (err, result) => {
        if (err) {
            console.error("ERRO AO SALVAR REVIEW:", err.message);
            return res.status(500).json({ sucesso: false, erro: err.message });
        }
        res.json({ sucesso: true, id: result.insertId });
    });
});

// get de feeds (achar as reviews)
app.get('/reviews', (req, res) => {
    const usuario_id = req.query.usuario_id || 0;
    const sql = `
        SELECT r.*, u.username, 
        (SELECT COUNT(*) FROM likes WHERE review_id = r.id) as total_likes,
        (SELECT COUNT(*) FROM likes WHERE review_id = r.id AND usuario_id = ?) as deu_like,
        (SELECT COUNT(*) FROM comentarios WHERE review_id = r.id) as total_comentarios
        FROM reviews r 
        JOIN usuarios u ON r.usuario_id = u.id 
        ORDER BY r.data_post DESC`;
    db.query(sql, [usuario_id], (err, results) => {
        if (err) return res.status(500).json([]);
        res.json(results); 
    });
});

//post de listas
app.post('/lista', (req, res) => {
    console.log("DADOS RECEBIDOS DO REACT:", req.body);
    const { usuario_id, categoria, titulo, imagem_url, status_consumo, nota_pessoal } = req.body;
    const sql = "INSERT INTO minhas_listas (usuario_id, categoria, titulo, imagem_url, status_consumo, nota_pessoal) VALUES (?, ?, ?, ?, ?, ?)";
    
    db.query(sql, [usuario_id, categoria, titulo, imagem_url, status_consumo, nota_pessoal], (err, result) => {
        if (err) {
            console.error("Erro ao inserir:", err.message);
            return res.status(500).json(err);
        }
        res.json({ id: result.insertId });
    });
});

// get de listas
app.get('/lista/:usuario_id/:categoria', (req, res) => {
    const { usuario_id, categoria } = req.params;
    const sql = "SELECT * FROM minhas_listas WHERE usuario_id = ? AND categoria = ?";
    db.query(sql, [usuario_id, categoria], (err, results) => {
        if (err) return res.status(500).json(err);
        res.json(results);
    });
});

//post de likes (com toggle)
app.post('/likes', (req, res) => {
    const { usuario_id, review_id } = req.body;
    console.log("like recebido:", { usuario_id, review_id });
    
    // verifica se o like já existe
    const sqlCheck = "SELECT * FROM likes WHERE usuario_id = ? AND review_id = ?";
    db.query(sqlCheck, [usuario_id, review_id], (err, results) => {
        if (err) return res.status(500).json(err);

        if (results.length > 0) {
            // se ele ja existe ele deleta o like
            const sqlDel = "DELETE FROM likes WHERE usuario_id = ? AND review_id = ?";
            db.query(sqlDel, [usuario_id, review_id], (err) => {
                if (err) return res.status(500).json(err);
                return res.json({ curtido: false });
            });
        } else {
            // se não existe, insere o like
            const sqlIns = "INSERT INTO likes (usuario_id, review_id) VALUES (?, ?)";
            db.query(sqlIns, [usuario_id, review_id], (err) => {
                if (err) return res.status(500).json(err);
                return res.json({ curtido: true });
            });
        }
    });
});

// post comentarios
app.post('/comentarios', (req, res) => {
    const { review_id, usuario_id, texto } = req.body;
    const sql = "INSERT INTO comentarios (review_id, usuario_id, texto) VALUES (?, ?, ?)";
    
    db.query(sql, [review_id, usuario_id, texto], (err, result) => {
        if (err) {
            console.error("Erro ao comentar:", err.message);
            return res.status(500).json(err);
        }
        res.json({ sucesso: true, id: result.insertId });
    });
});

// get comentarios (de review especifica)
app.get('/comentarios/:review_id', (req, res) => {
    const { review_id } = req.params;
    const sql = `
        SELECT c.*, u.username 
        FROM comentarios c 
        JOIN usuarios u ON c.usuario_id = u.id 
        WHERE c.review_id = ? 
        ORDER BY c.data_comentario ASC`;

    db.query(sql, [review_id], (err, results) => {
        if (err) return res.status(500).json([]);
        res.json(results);
    });
});


app.listen(3000, () => {
    console.log("Servidor rodando em http://localhost:3000");

})