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
    <div className="w-full max-w-5xl mx-auto p-4 md:p-8 text-slate-200 font-sans">
      
      {/* CABEÇALHO */}
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#d946ef] to-[#06b6d4]">
            Minha Lista de {props.categoria}
        </h2>
        <button 
          onClick={() => setMostrandoBusca(!mostrandoBusca)} 
          className={`px-5 py-2.5 rounded-xl font-bold transition-all shadow-lg ${mostrandoBusca ? 'bg-slate-700 hover:bg-slate-600 text-white' : 'bg-gradient-to-r from-[#9333ea] to-[#6366f1] hover:opacity-90 text-white shadow-[0_0_15px_rgba(147,51,234,0.3)]'}`}
        >
          {mostrandoBusca ? "Cancelar" : "+ Adicionar à Lista"}
        </button>
      </div>

      {/* ÁREA DE BUSCA */}
      {mostrandoBusca && (
        <div className="bg-[#111424] p-6 rounded-2xl mb-8 border border-slate-800 shadow-xl relative z-20">
          <input 
            type="text" 
            placeholder={`Buscar ${props.categoria} para adicionar...`}
            value={busca}
            onChange={(e) => buscarMidia(e.target.value)}
            className="w-full bg-[#0b0d17] border border-slate-800 rounded-xl py-3 px-4 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
          />

          {/* Resultados da busca */}
          {resultados.length > 0 && (
            <ul className="absolute top-full left-0 right-0 mt-2 mx-6 bg-[#1e2336] border border-slate-700 rounded-xl overflow-hidden shadow-2xl z-50">
              {resultados.map((item, index) => (
                <li 
                  key={index} 
                  className="cursor-pointer p-3 border-b border-slate-700/50 flex items-center gap-4 hover:bg-[#2a3047] transition-colors"
                  onClick={() => selecionarParaLista(item)} 
                >
                  {item.imagem ? (
                    <img src={item.imagem} alt={item.titulo} className="w-10 h-14 object-cover rounded-md flex-shrink-0 shadow-md" />
                  ) : (
                    <div className="w-10 h-14 bg-slate-700 rounded-md flex-shrink-0"></div>
                  )}
                  <strong className="font-medium text-slate-200 flex-1">{item.titulo}</strong>
                  <span className="text-xs font-semibold text-purple-400 bg-purple-400/10 px-3 py-1 rounded-full">
                    Adicionar +
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* TABELA DE ITENS */}
      <div className="bg-[#111424] border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[600px]">
                <thead className="bg-[#1e2336] text-slate-400 text-sm uppercase tracking-wider border-b border-slate-800">
                    <tr>
                        <th className="p-4 font-semibold">Capa</th>
                        <th className="p-4 font-semibold">Título</th>
                        <th className="p-4 font-semibold">Status</th>
                        <th className="p-4 font-semibold">Nota</th>
                        <th className="p-4 font-semibold text-center">Ações</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                    {itens.length === 0 ? (
                        <tr>
                            <td colSpan="5" className="p-10 text-center text-slate-500 font-medium">
                                Sua lista está vazia. Clique no botão acima para adicionar algo!
                            </td>
                        </tr>
                    ) : (
                        itens.map((item) => (
                        <tr key={item.id} className="hover:bg-[#15192b] transition-colors">
                            <td className="p-4 w-20">
                                {item.imagem_url ? (
                                    <img src={item.imagem_url} alt="Capa" className="w-12 h-16 object-cover rounded-lg shadow-md" />
                                ) : (
                                    <div className="w-12 h-16 bg-slate-800 rounded-lg"></div>
                                )}
                            </td>
                            <td className="p-4 font-bold text-slate-200 text-lg">{item.titulo}</td>
                            <td className="p-4">
                                <select 
                                    value={item.status_consumo} 
                                    onChange={(e) => atualizarItem(item.id, 'status', e.target.value)}
                                    className="bg-[#0b0d17] border border-slate-700 rounded-lg py-2 px-3 text-sm text-slate-300 focus:outline-none focus:border-purple-500 cursor-pointer"
                                >
                                    <option value={props.categoria === 'Jogos' ? 'Jogando' : 'Assistindo'}>
                                    {props.categoria === 'Jogos' ? 'Jogando' : 'Assistindo'}
                                    </option>
                                    <option value="Planejo">Planejo</option>
                                    <option value="Finalizado">Finalizado</option>
                                    <option value="Dropado">Dropado</option>
                                </select>
                            </td>
                            <td className="p-4">
                                <div className="flex items-center gap-2">
                                    <input 
                                        type="number" 
                                        min="0" max="10" 
                                        value={item.nota_pessoal}
                                        onChange={(e) => atualizarItem(item.id, 'nota', Number(e.target.value))}
                                        className="w-16 bg-[#0b0d17] border border-slate-700 rounded-lg py-2 px-3 text-sm text-slate-300 focus:outline-none focus:border-purple-500 text-center"
                                    />
                                    <span className="text-slate-500 text-sm">/ 10</span>
                                </div>
                            </td>
                            <td className="p-4 text-center">
                                <button 
                                    onClick={() => removerItem(item.id)}
                                    className="text-red-400 hover:text-red-300 hover:bg-red-500/10 px-3 py-2 rounded-lg transition-colors text-sm font-medium flex items-center justify-center gap-2 mx-auto"
                                >
                                    🗑 Excluir
                                </button>
                            </td>
                        </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
      </div>
      
    </div>
  );
}