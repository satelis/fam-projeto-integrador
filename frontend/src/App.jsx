import { useState } from 'react'
import Login from './Login'
import Cadastro from './Cadastro'
import Feed from './Feed'
import Lista from './Lista'

function App() {
  const [telaAtual, setTelaAtual] = useState('login');

  // Movemos a função de Logout para cá, pois o botão vai ficar na Sidebar agora!
  const fazerLogout = () => {
    localStorage.removeItem('usuarioNick');
    localStorage.removeItem('usuarioID');
    setTelaAtual('login');
  };

  // --- ÁREA DESLOGADA (Apenas Formulários) ---
  if (telaAtual === 'login') {
    return <Login onLoginSucesso={() => setTelaAtual('feed')} onIrParaCadastro={() => setTelaAtual('cadastro')} />
  }

  if (telaAtual === 'cadastro') {
    return <Cadastro onCadastroSucesso={() => setTelaAtual('login')} onVoltarAoLogin={() => setTelaAtual('login')} />
  }

  // --- ÁREA LOGADA (Dashboard com Menu Lateral) ---
  return (
    <div className="dashboard-container">
      
      {/* MENU LATERAL ESQUERDO */}
      <aside className="sidebar">
        <h2>GeekHub</h2> {/* Coloque o nome real do seu projeto aqui */}
        
        <button 
          className={`menu-btn ${telaAtual === 'feed' ? 'ativo' : ''}`} 
          onClick={() => setTelaAtual('feed')}
        >
          Feed
        </button>

        <button 
          className={`menu-btn ${telaAtual === 'perfil' ? 'ativo' : ''}`} 
          onClick={() => setTelaAtual('perfil')}
        >
          Meu Perfil
        </button>

        <hr style={{ borderColor: '#333', margin: '10px 0' }} />
        <span style={{ fontSize: '12px', color: '#888', textTransform: 'uppercase', paddingLeft: '12px' }}>Minhas Listas</span>

        <button 
          className={`menu-btn ${telaAtual === 'lista-animes' ? 'ativo' : ''}`} 
          onClick={() => setTelaAtual('lista-animes')}
        >
          Animes
        </button>

        <button 
          className={`menu-btn ${telaAtual === 'lista-filmes' ? 'ativo' : ''}`} 
          onClick={() => setTelaAtual('lista-filmes')}
        >
          Filmes
        </button>

        <button 
          className={`menu-btn ${telaAtual === 'lista-series' ? 'ativo' : ''}`} 
          onClick={() => setTelaAtual('lista-series')}
        >
          Séries
        </button>

        <button 
          className={`menu-btn ${telaAtual === 'lista-jogos' ? 'ativo' : ''}`} 
          onClick={() => setTelaAtual('lista-jogos')}
        >
          Jogos
        </button>

        {/* Empurra o botão de sair lá pro final */}
        <div style={{ marginTop: 'auto' }}>
          <button className="menu-btn" onClick={fazerLogout} style={{ width: '100%', color: '#ff4d4d' }}>
            Sair da Conta
          </button>
        </div>
      </aside>

      {/* CONTEÚDO DA DIREITA */}
      <main className="conteudo-principal">
        {telaAtual === 'feed' && <Feed />}
        
        {telaAtual === 'perfil' && <div><h2>Em construção: Meu Perfil 🛠️</h2></div>}
        
        {telaAtual === 'lista-animes' && <Lista categoria="Animes" />}
        {telaAtual === 'lista-filmes' && <Lista categoria="Filmes" />}
        {telaAtual === 'lista-series' && <Lista categoria="Séries" />}
        {telaAtual === 'lista-jogos' && <Lista categoria="Jogos" />}
      </main>

    </div>
  )
}

export default App