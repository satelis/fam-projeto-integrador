import { useState, useEffect } from 'react';

const CHAVE_TMDB = "b86652bc36a0beb002d68ac4bdd093ba";
const CHAVE_RAWG = "ef4e86db37e54732884687170f67a3ec";

export default function Lista(props) {
  // busca do localStorage ao iniciar (Agora buscamos do Banco, mas mantemos o estado inicial vazio)
  const [itens, setItens] = useState([]);
  
  // Pegamos o ID do usuário para saber de quem é a lista
  const usuarioID = localStorage.getItem('usuarioID');

  // Salva automático no navegador sempre que a lista mudar 
  // (Como agora usamos SQL, esse useEffect serve para carregar os dados da nuvem ao abrir a página)
  useEffect(() => {
    const carregarDaNuvem = async () => {
        try {
            const resposta = await fetch(`http://localhost:3000/lista/${usuarioID}/${props.categoria}`);
            const dados = await resposta.json();
            if (Array.isArray(dados)) {
                setItens(dados);
            }
        } catch (erro) {
            console.error("Erro ao carregar lista:", erro);
        }
    };
    if (usuarioID) carregarDaNuvem();
  }, [props.categoria, usuarioID]);

  // Estados da busca
  const [mostrandoBusca, setMostrandoBusca] = useState(false);
  const [busca, setBusca] = useState('');
  const [resultados, setResultados] = useState([]);

  const removerItem = async (idParaRemover) => {
    try {
        await fetch(`http://localhost:3000/lista/${idParaRemover}`, { method: 'DELETE' });
        setItens(itens.filter(item => item.id !== idParaRemover));
    } catch (erro) {
        console.error("Erro ao remover:", erro);
    }
  };

  const atualizarItem = async (id, campo, novoValor) => {
    // Preparando os dados para o banco (ajustando nomes de colunas)
    const itemRef = itens.find(it => it.id === id);
    const bodyEnvio = {
        status_consumo: campo === 'status' ? novoValor : itemRef.status_consumo,
        nota_pessoal: campo === 'nota' ? novoValor : itemRef.nota_pessoal
    };

    try {
        await fetch(`http://localhost:3000/lista/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(bodyEnvio)
        });
        
        // Atualiza a tela após o banco confirmar
        setItens(itens.map(item => item.id === id ? { ...item, status_consumo: bodyEnvio.status_consumo, nota_pessoal: bodyEnvio.nota_pessoal } : item));
    } catch (erro) {
        console.error("Erro ao atualizar:", erro);
    }
  };

  // BUSCA COM FILTRO E ORDENAÇÃO
  const buscarMidia = async (termoDigitado) => {
    setBusca(termoDigitado);
    if (termoDigitado.length < 3) {
      setResultados([]); 
      return;
    }

    let itensDaApi = []; 

    if (props.categoria === 'Animes') {
      try {
        const resposta = await fetch(`https://api.jikan.moe/v4/anime?q=${termoDigitado}&limit=15`);
        const dados = await resposta.json();
        itensDaApi = dados.data?.map(anime => ({ titulo: anime.title, imagem: anime.images?.jpg?.image_url || "" })) || [];
      } catch (erro) { console.error("Erro anime:", erro); }
    } 
    else if (props.categoria === 'Séries') {
      try {
        const resposta = await fetch(`https://api.tvmaze.com/search/shows?q=${termoDigitado}`);
        const dados = await resposta.json();
        itensDaApi = dados.map(item => ({ titulo: item.show.name, imagem: item.show.image ? item.show.image.medium : "" }));
      } catch (erro) { console.error("Erro série:", erro); }
    }
    else if (props.categoria === 'Filmes') {
      try {
        const url = `https://api.themoviedb.org/3/search/movie?api_key=${CHAVE_TMDB}&query=${termoDigitado}&language=pt-BR`;
        const resposta = await fetch(url);
        const dados = await resposta.json();
        const BASE_IMAGE_URL = "https://image.tmdb.org/t/p/w500";
        itensDaApi = dados.results.map(filme => ({ titulo: filme.title, imagem: filme.poster_path ? `${BASE_IMAGE_URL}${filme.poster_path}` : "" }));
      } catch (erro) { console.error("Erro filme:", erro); }
    }
    else if (props.categoria === 'Jogos') {
      try {
        const resposta = await fetch(`https://api.rawg.io/api/games?key=${CHAVE_RAWG}&search=${termoDigitado}&page_size=15`);
        const dados = await resposta.json();
        itensDaApi = dados.results.map(jogo => ({ titulo: jogo.name, imagem: jogo.background_image || "" }));
      } catch (erro) { console.error("Erro jogo:", erro); }
    }

    // Peneira anti-duplicata
    let resultadosFiltrados = itensDaApi.filter(
      itemApi => !itens.some(meuItem => meuItem.titulo === itemApi.titulo)
    );

    // Ordenação exata
    const buscaLower = termoDigitado.toLowerCase();
    resultadosFiltrados.sort((a, b) => {
      const tituloA = a.titulo.toLowerCase();
      const tituloB = b.titulo.toLowerCase();

      if (tituloA === buscaLower) return -1; 
      if (tituloB === buscaLower) return 1;
      if (tituloA.startsWith(buscaLower) && !tituloB.startsWith(buscaLower)) return -1;
      if (tituloB.startsWith(buscaLower) && !tituloA.startsWith(buscaLower)) return 1;
      
      return 0; 
    });

    setResultados(resultadosFiltrados.slice(0, 5));
  };

  const selecionarParaLista = async (midiaEncontrada) => {
    const novoItem = {
        usuario_id: usuarioID,
        categoria: props.categoria,
        titulo: midiaEncontrada.titulo,
        imagem_url: midiaEncontrada.imagem,
        status_consumo: props.categoria === 'Jogos' ? 'Jogando' : 'Assistindo', 
        nota_pessoal: 0 
    };

    try {
        const res = await fetch('http://localhost:3000/lista', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(novoItem)
        });
        
        if (res.ok) {
            const info = await res.json();
            setItens([{ ...novoItem, id: info.id }, ...itens]);
            setBusca('');
            setResultados([]);
            setMostrandoBusca(false);
        }
    } catch (erro) {
        console.error("Erro ao salvar item:", erro);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '900px', margin: '0 auto' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2>Minha Lista de {props.categoria}</h2>
        <button 
          onClick={() => setMostrandoBusca(!mostrandoBusca)} 
          style={{ padding: '10px 15px', background: '#007bff', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
        >
          {mostrandoBusca ? "Cancelar" : "+ Adicionar à Lista"}
        </button>
      </div>

      {mostrandoBusca && (
        <div style={{ background: '#1e1e24', padding: '15px', borderRadius: '8px', marginBottom: '20px', border: '1px solid #333' }}>
          <input 
            type="text" 
            placeholder={`Buscar ${props.categoria} para adicionar...`}
            value={busca}
            onChange={(e) => buscarMidia(e.target.value)}
            style={{ width: '100%', padding: '10px', borderRadius: '5px', border: 'none', marginBottom: '10px' }}
          />

          {resultados.length > 0 && (
            <ul style={{ background: '#eee', color: '#000', listStyle: 'none', padding: '0', borderRadius: '4px', overflow: 'hidden', margin: '0' }}>
              {resultados.map((item, index) => (
                <li 
                  key={index} 
                  style={{ cursor: 'pointer', padding: '10px', borderBottom: '1px solid #ccc', display: 'flex', alignItems: 'center', gap: '10px' }}
                  onClick={() => selecionarParaLista(item)} 
                >
                  {item.imagem ? (
                    <img src={item.imagem} alt={item.titulo} style={{ width: '30px', height: '45px', objectFit: 'cover', borderRadius: '4px' }} />
                  ) : (
                    <div style={{ width: '30px', height: '45px', background: '#ccc', borderRadius: '4px' }}></div>
                  )}
                  <strong>{item.titulo}</strong>
                  <span style={{ marginLeft: 'auto', fontSize: '12px', color: '#666' }}>Clique para adicionar</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', background: '#1e1e24', borderRadius: '8px', overflow: 'hidden' }}>
        <thead style={{ background: '#333', color: '#fff' }}>
          <tr>
            <th style={{ padding: '15px' }}>Capa</th>
            <th style={{ padding: '15px' }}>Título</th>
            <th style={{ padding: '15px' }}>Status</th>
            <th style={{ padding: '15px' }}>Nota</th>
            <th style={{ padding: '15px', textAlign: 'center' }}>Ações</th>
          </tr>
        </thead>
        <tbody>
          {itens.length === 0 ? (
            <tr>
              <td colSpan="5" style={{ padding: '20px', textAlign: 'center', color: '#888' }}>
                Sua lista está vazia. Clique no botão acima para adicionar algo!
              </td>
            </tr>
          ) : (
            itens.map((item) => (
              <tr key={item.id} style={{ borderBottom: '1px solid #333' }}>
                <td style={{ padding: '10px 15px' }}>
                  {item.imagem_url && <img src={item.imagem_url} alt="Capa" style={{ width: '40px', height: '60px', objectFit: 'cover', borderRadius: '4px' }} />}
                </td>
                <td style={{ padding: '10px 15px', fontWeight: 'bold' }}>{item.titulo}</td>
                <td style={{ padding: '10px 15px' }}>
                  <select 
                    value={item.status_consumo} 
                    onChange={(e) => atualizarItem(item.id, 'status', e.target.value)}
                    style={{ padding: '5px', background: '#333', color: 'white', border: '1px solid #555', borderRadius: '4px' }}
                  >
                    <option value={props.categoria === 'Jogos' ? 'Jogando' : 'Assistindo'}>
                      {props.categoria === 'Jogos' ? 'Jogando' : 'Assistindo'}
                    </option>
                    <option value="Planejo">Planejo</option>
                    <option value="Finalizado">Finalizado</option>
                    <option value="Dropado">Dropado</option>
                  </select>
                </td>
                <td style={{ padding: '10px 15px' }}>
                  <input 
                    type="number" 
                    min="0" max="10" 
                    value={item.nota_pessoal}
                    onChange={(e) => atualizarItem(item.id, 'nota', Number(e.target.value))}
                    style={{ width: '60px', padding: '5px', background: '#333', color: 'white', border: '1px solid #555', borderRadius: '4px' }}
                  />
                </td>
                <td style={{ padding: '10px 15px', textAlign: 'center' }}>
                  <button 
                    onClick={() => removerItem(item.id)}
                    style={{ padding: '5px 10px', background: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                  >
                    Excluir
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
      
    </div>
  );
}