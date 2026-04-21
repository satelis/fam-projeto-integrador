// Login.jsx
import { useState } from 'react';

export default function Login(props) {
    const [usuario, setUsuario] = useState('');
    const [senha, setSenha] = useState('');
    const [erro, setErro] = useState('');

    const fazerLogin = async (evento) => {
    evento.preventDefault(); 
    setErro('');

    try {
        const resposta = await fetch('http://localhost:3000/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: usuario, senha: senha })
        });

        const dados = await resposta.json();

        if (resposta.ok && dados.sucesso) {
            // se der sucesso salva tudo no navegador
            localStorage.setItem('usuarioID', dados.id);
            localStorage.setItem('usuarioNick', dados.username);

            console.log("Acesso OK. ID " + dados.id);
            props.onLoginSucesso(); 
        } else {
            setErro(dados.mensagem || "Usuário ou senha incorretos.");
        }
        } catch (err) {
            setErro("Servidor Node desligado.");
        }
    };

    return (
        <div id="login-box" className="container-login">
            <h2>Login</h2>
            
            <form onSubmit={fazerLogin}>
                <label>Usuário:</label>
                <input 
                    type="text" 
                    placeholder="Digite qualquer usuário" 
                    value={usuario}
                    onChange={(e) => setUsuario(e.target.value)}
                />

                <label>Senha:</label>
                <input 
                    type="password" 
                    placeholder="Digite qualquer senha" 
                    value={senha}
                    onChange={(e) => setSenha(e.target.value)}
                />

                <button type="submit">Entrar</button>
            </form>

            {erro && <p style={{ color: 'red' }}>{erro}</p>}

            <div style={{ marginTop: '20px', borderTop: '1px solid #ccc', paddingTop: '10px' }}>
                <p>Novo por aqui?</p>
                <button type="button" onClick={props.onIrParaCadastro}>
                    Cadastre-se
                </button>
            </div>
        </div>
    );
}