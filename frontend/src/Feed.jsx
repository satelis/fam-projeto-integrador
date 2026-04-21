import { useState, useEffect } from 'react';

export default function Feed(props) {
  const [reviews, setReviews] = useState([]);

  const buscarReviews = async () => {
    try {
      const resposta = await fetch('http://localhost:3000/reviews');
      const dados = await resposta.json();
      setReviews(dados);
    } 
    catch (erro) {
      console.error("Erro ao carregar feed:", erro);
    }
};

//assim que o usuario loga, carrega o feed
useEffect(() => {
  buscarReviews();
}, []);;

  const [categoria, setCategoria] = useState('Animes');
  const [busca, setBusca] = useState('');
  const [resultados, setResultados] = useState([]); 
  const [midiaSelecionada, setMidiaSelecionada] = useState('');
  
  // guarda a imagem que o usuário escolheu ao clicar
  const [imagemSelecionada, setImagemSelecionada] = useState('');
  
  const [nota, setNota] = useState('');
  const [texto, setTexto] = useState('');

  const CHAVE_TMDB = "b86652bc36a0beb002d68ac4bdd093ba";
  const CHAVE_RAWG = "ef4e86db37e54732884687170f67a3ec";

  const buscarMidia = async (termoDigitado) => {
    setBusca(termoDigitado);
    setMidiaSelecionada(''); 
    setImagemSelecionada('');

    if (termoDigitado.length < 3) {
      setResultados([]); 
      return;
    }

    // --- BUSCA DE ANIMES (Jikan API) ---
    if (categoria === 'Animes') {
      try {
        const resposta = await fetch(`https://api.jikan.moe/v4/anime?q=${termoDigitado}&limit=5`);
        if (!resposta.ok) throw new Error("Erro na rede / limite de chamadas da API");

        const dados = await resposta.json();

        if (dados && dados.data) {
          setResultados(dados.data.map(anime => ({
            titulo: anime.title,
            imagem: anime.images?.jpg?.image_url || "" 
          })));
        } else {
          // se der erro (vir vazio) limpa a lista
          setResultados([]);
        }
      } catch (erro) {
        console.error("Erro anime:", erro);
        setResultados([]); //se der erro limpa a lista
      }
    
    }

    // --- BUSCA DE SÉRIES (TVmaze API) ---
    else if (categoria === 'Séries') {
      try {
        const resposta = await fetch(`https://api.tvmaze.com/search/shows?q=${termoDigitado}`);
        const dados = await resposta.json();
        
        setResultados(dados.slice(0, 5).map(item => ({
          titulo: item.show.name,
          imagem: item.show.image ? item.show.image.medium : "" 
        })));
      } catch (erro) {
        console.error("Erro série:", erro);
      }
    } 
    // --- BUSCA DE FILMES (TMDB API) ---
    else if (categoria === 'Filmes') {
      try {
        // passamos a api_key na URL e pedimos os dados em português
        const resposta = await fetch(`https://api.themoviedb.org/3/search/movie?api_key=${CHAVE_TMDB}&query=${termoDigitado}&language=pt-BR`);
        const dados = await resposta.json();
        
        // O TMDB devolve as capas só com o final do link. Precisamos colar essa base URL antes:
        const BASE_IMAGE_URL = "https://image.tmdb.org/t/p/w500";

        setResultados(dados.results.slice(0, 5).map(filme => ({
          titulo: filme.title,
          // Se tiver capa, junta a URL base com o pedaço que a API mandou
          imagem: filme.poster_path ? `${BASE_IMAGE_URL}${filme.poster_path}` : "" 
        })));
      } catch (erro) {
        console.error("Erro filme:", erro);
      }
    }
    // --- BUSCA DE JOGOS (RAWG API) ---
    else if (categoria === 'Jogos') {
      try {
        const resposta = await fetch(`https://api.rawg.io/api/games?key=${CHAVE_RAWG}&search=${termoDigitado}&page_size=5`);
        const dados = await resposta.json();
        
        setResultados(dados.results.map(jogo => ({
          titulo: jogo.name,
          imagem: jogo.background_image || "" 
        })));
      } catch (erro) {
        console.error("Erro jogo:", erro);
      }
    }
  };

  const postarReview = async (evento) => {
    evento.preventDefault();

    if (!midiaSelecionada) {
      alert("Selecione uma mídia antes de postar!");
      return;
    }

    const novaReview = {
      usuario_id: localStorage.getItem('usuarioID'), // Pegando o ID de quem logou
      categoria: categoria,
      midia: midiaSelecionada,
      imagem_url: imagemSelecionada, 
      nota: nota,
      texto: texto
    };

    try {
      const resposta = await fetch('http://localhost:3000/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(novaReview)
      });

      if (resposta.ok) {
        alert("Review publicada com sucesso!");
        buscarReviews(); // Recarrega a lista para o post novo aparecer
        // Limpa os campos
        setBusca('');
        setMidiaSelecionada('');
        setNota('');
        setTexto('');
      }
    } catch (err) {
      alert("Erro ao conectar com o servidor.");
    }
  };

  return (
    <div className="feed-container" style={{ maxWidth: '600px', margin: '0 auto', padding: '20px' }}>

      <div style={{ border: '1px solid #444', padding: '20px', borderRadius: '8px', marginBottom: '30px' }}>
        <h3>Escrever uma Avaliação</h3>
        
        <form onSubmit={postarReview} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          
          <select value={categoria} onChange={(e) => setCategoria(e.target.value)} style={{ padding: '8px' }}>
            <option value="Animes">Animes</option>
            <option value="Jogos">Jogos</option>
            <option value="Filmes">Filmes</option>
            <option value="Séries">Séries</option>
          </select>

          <input 
            type="text" 
            placeholder={`Buscar ${categoria}...`}
            value={busca}
            onChange={(e) => buscarMidia(e.target.value)}
            style={{ padding: '8px' }}
          />

          {resultados.length > 0 && !midiaSelecionada && (
            <ul style={{ background: '#eee', color: '#000', listStyle: 'none', padding: '0', marginTop: '-10px', borderRadius: '4px', overflow: 'hidden' }}>
              {resultados.map((item, index) => (
                <li 
                  key={index} 
                  style={{ cursor: 'pointer', padding: '10px', borderBottom: '1px solid #ccc', display: 'flex', alignItems: 'center', gap: '10px' }}
                  onClick={() => {
                    // Ao clicar, guardamos tanto o título quanto a imagem nos estados
                    setMidiaSelecionada(item.titulo);
                    setImagemSelecionada(item.imagem);
                    setBusca(item.titulo); 
                    setResultados([]); 
                  }}
                >
                  {/* Pequena miniatura da imagem na lista de busca */}
                  {item.imagem ? (
                    <img src={item.imagem} alt={item.titulo} style={{ width: '40px', height: '55px', objectFit: 'cover', borderRadius: '4px' }} />
                  ) : (
                    <div style={{ width: '40px', height: '55px', background: '#ccc', borderRadius: '4px' }}></div>
                  )}
                  {item.titulo}
                </li>
              ))}
            </ul>
          )}

          <div style={{ display: 'flex', gap: '10px' }}>
            <input 
              type="number" 
              placeholder="Nota (0 a 10)" 
              min="0" max="10" 
              value={nota}
              onChange={(e) => setNota(e.target.value)}
              required
              style={{ width: '120px', padding: '8px' }}
            />
          </div>

          <textarea 
            placeholder="O que você achou?" 
            rows="4" 
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            required
            style={{ padding: '8px' }}
          />

          <button type="submit" style={{ padding: '10px', background: '#007bff', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
            Publicar Review
          </button>
        </form>
      </div>

    <h2>Últimas Avaliações</h2>
      {reviews.map((review) => (
        <div key={review.id} style={{ border: '1px solid #ccc', margin: '15px 0', padding: '15px', borderRadius: '8px', display: 'flex', gap: '20px' }}>
          
          {review.imagem_url && (
            <img src={review.imagem_url} alt={review.midia} style={{ width: '100px', height: '140px', objectFit: 'cover', borderRadius: '8px' }} />
          )}

          <div style={{ flex: 1 }}>
            <h4 style={{ margin: '0 0 10px 0' }}>
              {review.username} avaliou o {review.categoria?.slice(0, -1)}: <span style={{ color: '#007bff' }}>{review.midia}</span>
            </h4>
            <p style={{ margin: '0 0 10px 0' }}><strong>Nota:</strong> {review.nota}/10</p>
            <p style={{ margin: '0' }}>{review.texto}</p>
          </div>
          
        </div>
      ))}

    </div>
  );
}