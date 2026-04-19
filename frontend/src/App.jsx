import { useState } from 'react'
import Login from './Login'
import Cadastro from './Cadastro'
import Feed from './Feed'

function App() {
  // diz em qual tela estamos
  const [telaAtual, setTelaAtual] = useState('login')

  return (
    <main>
      <h1>GeekHub</h1>
      
      {/* Se o estado for 'login', desenha o componente Login */}
      {telaAtual === 'login' && (
        <Login 
          onLoginSucesso={() => setTelaAtual('feed')} 
          onIrParaCadastro={() => setTelaAtual('cadastro')} 
        />
      )}

      {/* Se o estado for 'cadastro', desenha o componente Cadastro */}
      {telaAtual === 'cadastro' && (
        <Cadastro 
          onCadastroSucesso={() => setTelaAtual('login')}
          onVoltarAoLogin={() => setTelaAtual('login')}
        />
      )}

      {/* Se o estado for 'feed', desenha o Feed */}
      {telaAtual === 'feed' && (
        <Feed onSair={() => setTelaAtual('login')} />
      )}
    </main>
  )
}

export default App