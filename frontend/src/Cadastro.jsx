import { useState } from 'react';

export default function Cadastro(props) {
    const [usuario, setUsuario] = useState('');
    const [senha, setSenha] = useState('');
    const [confirmarSenha, setConfirmarSenha] = useState('');
    const [erro, setErro] = useState('');

    const fazerCadastro = (evento) => {
        evento.preventDefault();
        setErro(''); 

        // validação de senha
        if (senha !== confirmarSenha) {
            setErro("As senhas diferem!");
            return;
        }

        if (usuario !== '' && senha !== '') {
            // Finge que salvou
            alert("Simulação: Usuário " + usuario + " cadastrado com sucesso!");
            // Manda o App voltar para a tela de login
            props.onCadastroSucesso(); 
        } else {
            setErro("Preencha todos os campos.");
        }
    };

    return (
        <div className="container-login">
            <h2>Registrar novo usuário</h2>
            
            <form onSubmit={fazerCadastro}>
                <label>Usuário:</label>
                <input 
                    type="text" 
                    value={usuario}
                    onChange={(e) => setUsuario(e.target.value)}
                />

                <label>Senha:</label>
                <input 
                    type="password" 
                    value={senha}
                    onChange={(e) => setSenha(e.target.value)}
                />

                <label>Confirmar Senha:</label>
                <input 
                    type="password" 
                    value={confirmarSenha}
                    onChange={(e) => setConfirmarSenha(e.target.value)}
                />

                <button type="submit">Cadastrar</button>
            </form>

            {erro && <p style={{ color: 'red' }}>{erro}</p>}

            <div style={{ marginTop: '20px', borderTop: '1px solid #ccc', paddingTop: '10px' }}>
                <p>Já é de casa?</p>
                <button type="button" onClick={props.onVoltarAoLogin}>
                    Voltar ao Login
                </button>
            </div>
        </div>
    );
}