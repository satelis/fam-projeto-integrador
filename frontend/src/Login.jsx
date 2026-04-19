// Login.jsx
import { useState } from 'react';

export default function Login(props) {
    const [usuario, setUsuario] = useState('');
    const [senha, setSenha] = useState('');
    const [erro, setErro] = useState('');

    const fazerLogin = (evento) => {
        evento.preventDefault(); 
        setErro('');

        // Simulação: Se ele preencheu os dois campos, deixa passar
        if (usuario !== '' && senha !== '') {
            console.log("Mock de Login: Acesso Liberado!");
            // Aqui avisamos o App.jsx para trocar para a tela do Feed
            props.onLoginSucesso(); 
        } else {
            setErro("Preencha usuário e senha para entrar.");
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