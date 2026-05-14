import { useState } from 'react'
import Login from './Login'
import Cadastro from './Cadastro'
import Feed from './Feed'
import Lista from './Lista'
import Perfil from './Perfil'
import PerfilPublico from './PerfilPublico'

function App() {
  const [telaAtual, setTelaAtual] = useState('login');

  const fazerLogout = () => {
    localStorage.removeItem('usuarioNick');
    localStorage.removeItem('usuarioID');
    setTelaAtual('login');
  };

  // ÁREA DESLOGADA
  if (telaAtual === 'login') {
    return <Login onLoginSucesso={() => setTelaAtual('feed')} onIrParaCadastro={() => setTelaAtual('cadastro')} />
  }

  if (telaAtual === 'cadastro') {
    return <Cadastro onCadastroSucesso={() => setTelaAtual('login')} onVoltarAoLogin={() => setTelaAtual('login')} />
  }

  // FUNÇÃO AUXILIAR PARA O ESTILO DOS BOTÕES
  const getBotaoClass = (tela) => {
    // Adicionei um "flex items-center gap-3" aqui para o emoji ficar alinhado com o texto
    const baseClass = "w-full text-left px-4 py-3 rounded-xl font-medium transition-all duration-200 flex items-center gap-3 ";
    const activeClass = "bg-gradient-to-r from-[#9333ea] to-[#6366f1] text-white shadow-[0_0_15px_rgba(147,51,234,0.3)]";
    const inactiveClass = "text-slate-400 hover:text-slate-200 hover:bg-[#1e2336]";
    
    return baseClass + (telaAtual === tela ? activeClass : inactiveClass);
  };

  // ÁREA LOGADA
  return (
    <div className="flex h-screen w-full bg-[#070913] text-white font-sans overflow-hidden">
      
      {/* MENU LATERAL ESQUERDO */}
      <aside className="w-64 bg-[#111424] p-6 flex flex-col gap-2 border-r border-slate-800 shadow-2xl z-20 shrink-0">
        
        {/* LOGO */}
        <h2 
          className="text-3xl font-black mb-8 text-center tracking-tight cursor-pointer bg-clip-text text-transparent bg-gradient-to-r from-[#d946ef] to-[#06b6d4]"
          onClick={() => setTelaAtual('feed')}
        >
          GeekHub
        </h2> 
        
        <button className={getBotaoClass('feed')} onClick={() => setTelaAtual('feed')}>
          <span className="text-xl">📰</span> Feed
        </button>

        <button className={getBotaoClass('perfil')} onClick={() => setTelaAtual('perfil')}>
          <span className="text-xl">👤</span> Meu Perfil
        </button>

        <hr className="border-t border-slate-800 my-2" />
        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider pl-4 mb-2">Minhas Listas</span>

        <button className={getBotaoClass('lista-animes')} onClick={() => setTelaAtual('lista-animes')}>
          <span className="text-xl">🎌</span> Animes
        </button>

        <button className={getBotaoClass('lista-filmes')} onClick={() => setTelaAtual('lista-filmes')}>
          <span className="text-xl">🎬</span> Filmes
        </button>

        <button className={getBotaoClass('lista-series')} onClick={() => setTelaAtual('lista-series')}>
          <span className="text-xl">📺</span> Séries
        </button>

        <button className={getBotaoClass('lista-jogos')} onClick={() => setTelaAtual('lista-jogos')}>
          <span className="text-xl">🎮</span> Jogos
        </button>

        {/* Botão de sair vai pro final */}
        <div className="mt-auto pt-4 border-t border-slate-800">
          <button 
            className="w-full text-left px-4 py-3 rounded-xl font-medium transition-all duration-200 flex items-center gap-3 text-red-400 hover:text-red-300 hover:bg-red-500/10" 
            onClick={fazerLogout}
          >
            <span className="text-xl">🚪</span> Sair da Conta
          </button>
        </div>
      </aside>

      {/* CONTEÚDO DA DIREITA */}
      <main className="flex-1 h-full overflow-y-auto bg-[#070913] relative">
        
        {/* Efeitos de brilho no fundo */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-900/10 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-900/10 rounded-full blur-[120px] pointer-events-none"></div>

        <div className="relative z-10 w-full min-h-full">
            {telaAtual === 'feed' && <Feed setTelaAtual={setTelaAtual} />}
            
            {telaAtual === 'perfil' && <Perfil setTelaAtual={setTelaAtual} />}
            {telaAtual === 'perfil-publico' && <PerfilPublico setTelaAtual={setTelaAtual} />}
            
            {telaAtual === 'lista-animes' && <Lista categoria="Animes" />}
            {telaAtual === 'lista-filmes' && <Lista categoria="Filmes" />}
            {telaAtual === 'lista-series' && <Lista categoria="Séries" />}
            {telaAtual === 'lista-jogos' && <Lista categoria="Jogos" />}
        </div>
      </main>

    </div>
  )
}

export default App