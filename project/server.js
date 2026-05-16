const express = require('express');
const cors = require('cors');
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
    const sql = "SELECT id, username, avatar_url FROM usuarios WHERE username = ? AND senha = ?";

    db.query(sql, [username, senha], (err, results) => {
        if (err) {
            return res.status(500).json({ sucesso : false, mensagem: "Erro de banco"});
        }

        if (results.length > 0 ) {
            res.json({
                sucesso: true,
                id: results[0].id,
                username: results[0].username,
                avatar_url: results[0].avatar_url
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
            console.log("ERRO DO MYSQL:", err.message);
            return res.status(500).json({ sucesso: false, mensagem: "Erro ao cadastrar usuário." });
        }
        //retorna id do user
        res.json({ mensagem: "Usuário criado.", id: result.insertId });
    });
});

// put usuarios (avatar)
app.put('/usuarios/:id/avatar', (req, res) => {
    const { id } = req.params;
    const { avatar_url } = req.body;
    const sql = "UPDATE usuarios SET avatar_url = ? WHERE id = ?";
    
    db.query(sql, [avatar_url, id], (err, result) => {
        if (err) {
            console.error("ERRO AO ATUALIZAR AVATAR:", err.message);
            return res.status(500).json({ sucesso: false, erro: err.message });
        }
        res.json({ sucesso: true, mensagem: "Avatar atualizado!" });
    });
});

// get de usuarios
app.get('/usuarios/:id', (req, res) => {
    const { id } = req.params;
    const sql = "SELECT id, username, avatar_url FROM usuarios WHERE id = ?";
    
    db.query(sql, [id], (err, results) => {
        if (err) {
            console.error("Erro ao buscar usuário:", err.message);
            return res.status(500).json({ sucesso: false, mensagem: "Erro ao buscar usuário." });
        }
        if (results.length > 0) {
            res.json(results[0]);
        } else {
            res.status(404).json({ mensagem: "Usuário não encontrado." });
        }
    });
});

//post de feed (salvar review)
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

// get de feed (achar as reviews)
app.get('/reviews', (req, res) => {
    const usuario_id = req.query.usuario_id || 0;
    // Adicionamos o u.avatar_url no SELECT
    const sql = `
        SELECT r.*, u.username, u.avatar_url, 
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

//put de feed (esse existe pra edição)
app.put('/reviews/:id', (req, res) => {
    const { id } = req.params;
    const { texto, nota } = req.body; 
    const sql = "UPDATE reviews SET texto = ?, nota = ? WHERE id = ?";
    
    db.query(sql, [texto, nota, id], (err, result) => {
        if (err) {
                console.error("Erro ao editar review:", err.message);
                return res.status(500).json({ sucesso: false, mensagem: "Erro interno ao editar." });
            }
        res.json({ mensagem: "Post editado." });
    });
});

//delete post
app.delete('/reviews/:id', (req, res) => {
    const { id } = req.params;
    const sql = "DELETE FROM reviews WHERE id = ?";

    db.query(sql, [id], (err, result) => {
        if (err) {
            console.error("ERRO AO DELETAR REVIEW:", err.message);
            return res.status(500).json({ sucesso: false, erro: err.message });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ sucesso: false, mensagem: "Review não encontrada." });
        }

        res.json({ sucesso: true, mensagem: "Review deletada com sucesso." });
    });
});

//post de listas
app.post('/lista', (req, res) => {
    console.log("DADOS RECEBIDOS DO REACT:", req.body);
    const { usuario_id, categoria, titulo, imagem_url, status_consumo, nota_pessoal } = req.body;
    const sql = "INSERT INTO minhas_listas (usuario_id, categoria, titulo, imagem_url, status_consumo, nota_pessoal) VALUES (?, ?, ?, ?, ?, ?)";
    
    db.query(sql, [usuario_id, categoria, titulo, imagem_url, status_consumo, nota_pessoal], (err, result) => {
        if (err) {
            console.error("Erro ao inserir na lista:", err.message);
            return res.status(500).json({ sucesso: false, mensagem: "Erro ao salvar na lista." });
        }
        res.json({ id: result.insertId });
    });
});

// put de listas
app.put('/lista/:id', (req, res) => {
    const { id } = req.params;
    const { status_consumo, nota_pessoal } = req.body;
    
    const sql = "UPDATE minhas_listas SET status_consumo = ?, nota_pessoal = ? WHERE id = ?";
    
    db.query(sql, [status_consumo, nota_pessoal, id], (err, result) => {
        if (err) {
            console.error("Erro ao atualizar lista no banco:", err.message);
            return res.status(500).json({ sucesso: false, erro: err.message });
        }
        res.json({ sucesso: true, mensagem: "Item da lista atualizado." });
    });
});

// delete de listas
app.delete('/lista/:id', (req, res) => {
    const { id } = req.params;
    const sql = "DELETE FROM minhas_listas WHERE id = ?";

    db.query(sql, [id], (err, result) => {
        if (err) {
            console.error("ERRO AO REMOVER ITEM DA LISTA:", err.message);
            return res.status(500).json({ sucesso: false, erro: err.message });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ sucesso: false, mensagem: "Item não encontrado." });
        }

        res.json({ sucesso: true, mensagem: "Item removido da lista." });
    });
});

// get de listas
app.get('/lista/:usuario_id/:categoria', (req, res) => {
    const { usuario_id, categoria } = req.params;
    const sql = "SELECT * FROM minhas_listas WHERE usuario_id = ? AND categoria = ?";
    db.query(sql, [usuario_id, categoria], (err, results) => {
        if (err) {
            console.error("Erro ao buscar lista:", err.message);
            return res.status(500).json([]);
        }
        res.json(results);
    });
});

//post de likes (com toggle)
app.post('/likes', (req, res) => {
    const { usuario_id, review_id } = req.body;
    
    const sqlCheck = "SELECT * FROM likes WHERE usuario_id = ? AND review_id = ?";
    db.query(sqlCheck, [usuario_id, review_id], (err, results) => {
        if (err) {
            console.error("Erro ao checar like:", err.message);
            return res.status(500).json({ sucesso: false, mensagem: "Erro no servidor." });
        }

        if (results.length > 0) {
            const sqlDel = "DELETE FROM likes WHERE usuario_id = ? AND review_id = ?";
            db.query(sqlDel, [usuario_id, review_id], (err) => {
                if (err) {
                    console.error("Erro ao remover like:", err.message);
                    return res.status(500).json({ sucesso: false, mensagem: "Erro ao remover." });
                }
                return res.json({ curtido: false });
            });
        } else {
            const sqlIns = "INSERT INTO likes (usuario_id, review_id) VALUES (?, ?)";
            db.query(sqlIns, [usuario_id, review_id], (err) => {
                if (err) {
                    console.error("Erro ao inserir like:", err.message);
                    return res.status(500).json({ sucesso: false, mensagem: "Erro ao inserir." });
                }
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
            return res.status(500).json({ sucesso: false, mensagem: "Erro ao publicar comentário." });
        }
        res.json({ sucesso: true, id: result.insertId });
    });
});

// get comentarios (de review especifica)
app.get('/comentarios/:review_id', (req, res) => {
    const { review_id } = req.params;
    const sql = `
        SELECT c.*, u.username, u.avatar_url 
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
});