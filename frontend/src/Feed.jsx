import { useState, useEffect } from 'react';

export default function Feed(props) {
    const [reviews, setReviews] = useState([]); 
    const [editandoId, setEditandoId] = useState(null); 
    const [textoEditado, setTextoEditado] = useState("");
    const [comentariosAbertos, setComentariosAbertos] = useState({}); 
    const [textoComentarios, setTextoComentarios] = useState({});   
    const [notaEditada, setNotaEditada] = useState("");

    const buscarReviews = async () => {
        const usuario_id = localStorage.getItem('usuarioID');
        
        //carregar reviews
        try {
            const resposta = await fetch(`http://localhost:3000/reviews?usuario_id=${usuario_id}`);
            const dados = await resposta.json();
            setReviews(dados);
        } 
        catch (erro) {
            console.error("Erro ao carregar feed:", erro);
        }
    };

    //função de dar like
    const darLike = async (review_id) => {
        const usuario_id = localStorage.getItem('usuarioID');
        
        try {
            await fetch('http://localhost:3000/likes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ usuario_id, review_id })
            });
            
            buscarReviews(); 
        } catch (erro) {
            console.error("Erro ao curtir:", erro);
        }
    };

    // função de carregar e postar comentarios
    const carregarComentarios = async (review_id) => {
        //função pra permitir ocultar os comentários de volta
        if (comentariosAbertos[review_id]) {
            setComentariosAbertos(prev => {
                const novoEstado = { ...prev };
                delete novoEstado[review_id]; 
                return novoEstado;
            });
            return;
        }  
        
        try { 
            const res = await fetch(`http://localhost:3000/comentarios/${review_id}`);
            const dados = await res.json();
            setComentariosAbertos(prev => ({ ...prev, [review_id]: Array.isArray(dados) ? dados : [] }));
        } catch (err) {
            console.error("Erro ao carregar:", err);
        }
    };

    const postarComentario = async (review_id) => {
        const usuario_id = localStorage.getItem('usuarioID');
        const texto = textoComentarios[review_id];

        if (!texto || !texto.trim()) return;

        try {
            await fetch('http://localhost:3000/comentarios', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ review_id, usuario_id, texto })
            });

            //sempre limpa o comentario ao fazer um novo, e recarrega a pagina para que mostre o novo comentario
            setTextoComentarios(prev => ({ ...prev, [review_id]: "" })); 
            carregarComentarios(review_id);
            buscarReviews();
        } catch (err) {
            console.error("Erro ao postar:", err);
        }
    };

    //assim que o usuario loga, carrega o feed
    useEffect(() => {
        buscarReviews();
    }, []);

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

        // BUSCA DE ANIMES (Jikan API)
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

        // BUSCA DE SÉRIES (TVmaze API)
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
        // BUSCA DE FILMES (TMDB API)
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
        // BUSCA DE JOGOS (RAWG API)
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

    const atualizarReview = async (review_id) => {
        if (notaEditada > 10 || notaEditada < 0) {
            alert("A nota deve ser entre 0 e 10!");
            return; 
        }

        try {
            const resposta = await fetch(`http://localhost:3000/reviews/${review_id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    texto: textoEditado, 
                    nota: notaEditada 
                })
            });

            if (resposta.ok) {
                //fecha e atualiza a pagina do feed
                setEditandoId(null); 
                buscarReviews(); 
            }
        } catch (err) {
            console.error("Erro ao atualizar review:", err);
        }
    };

    const deletarReview = async (review_id) => {
        if (!window.confirm("Tem certeza que deseja deletar esta review?")) return;

        try {
            const resposta = await fetch(`http://localhost:3000/reviews/${review_id}`, {
                method: 'DELETE',
            });

            if (resposta.ok) {
                buscarReviews(); 
            } else {
                alert("Erro ao excluir a review.");
            }
        } catch (err) {
            console.error("Erro ao deletar review:", err);
        }
    };

    return (
        <div className="w-full max-w-3xl mx-auto p-4 md:p-8 text-slate-200 font-sans">

            {/* CAIXA DE NOVA AVALIAÇÃO */}
            <div className="bg-[#111424] border border-slate-800 p-6 md:p-8 rounded-2xl mb-10 shadow-xl relative">
                <h3 className="text-xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-[#d946ef] to-[#06b6d4]">
                    Escrever uma Avaliação
                </h3>
                
                <form onSubmit={postarReview} className="flex flex-col gap-4">
                    
                    {/* Linha 1: Categoria e Busca */}
                    <div className="flex flex-col md:flex-row gap-4">
                        <select 
                            value={categoria} 
                            onChange={(e) => setCategoria(e.target.value)} 
                            className="bg-[#0b0d17] border border-slate-800 rounded-xl py-3 px-4 text-slate-200 focus:outline-none focus:border-purple-500 transition-colors md:w-1/3"
                        >
                            <option value="Animes">Animes</option>
                            <option value="Jogos">Jogos</option>
                            <option value="Filmes">Filmes</option>
                            <option value="Séries">Séries</option>
                        </select>

                        <div className="relative md:w-2/3">
                            <input 
                                type="text" 
                                placeholder={`Buscar ${categoria}...`}
                                value={busca}
                                onChange={(e) => buscarMidia(e.target.value)}
                                className="w-full bg-[#0b0d17] border border-slate-800 rounded-xl py-3 px-4 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-purple-500 transition-colors"
                            />

                            {/* Dropdown de Resultados */}
                            {resultados.length > 0 && !midiaSelecionada && (
                                <ul className="absolute top-full left-0 right-0 mt-2 bg-[#1e2336] border border-slate-700 rounded-xl overflow-hidden shadow-2xl z-50">
                                    {resultados.map((item, index) => (
                                        <li 
                                            key={index} 
                                            className="cursor-pointer p-3 border-b border-slate-700/50 flex items-center gap-3 hover:bg-[#2a3047] transition-colors"
                                            onClick={() => {
                                                setMidiaSelecionada(item.titulo);
                                                setImagemSelecionada(item.imagem);
                                                setBusca(item.titulo); 
                                                setResultados([]); 
                                            }}
                                        >
                                            {item.imagem ? (
                                                <img src={item.imagem} alt={item.titulo} className="w-10 h-14 object-cover rounded-md flex-shrink-0" />
                                            ) : (
                                                <div className="w-10 h-14 bg-slate-700 rounded-md flex-shrink-0"></div>
                                            )}
                                            <span className="font-medium text-slate-200 truncate">{item.titulo}</span>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </div>

                    {/* Nota */}
                    <div>
                        <input 
                            type="number" 
                            placeholder="Nota (0 a 10)" 
                            min="0" max="10" 
                            value={nota}
                            onChange={(e) => setNota(e.target.value)}
                            required
                            className="w-36 bg-[#0b0d17] border border-slate-800 rounded-xl py-3 px-4 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-purple-500 transition-colors"
                        />
                    </div>

                    {/* Review Texto */}
                    <textarea 
                        placeholder="O que você achou?" 
                        rows="4" 
                        value={texto}
                        onChange={(e) => setTexto(e.target.value)}
                        required
                        className="w-full bg-[#0b0d17] border border-slate-800 rounded-xl py-3 px-4 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-purple-500 transition-colors resize-y min-h-[100px]"
                    />

                    <button 
                        type="submit" 
                        className="w-full mt-2 bg-gradient-to-r from-[#9333ea] to-[#6366f1] text-white font-bold rounded-xl py-3.5 hover:opacity-90 transition-opacity shadow-[0_0_20px_rgba(147,51,234,0.3)]"
                    >
                        Publicar Review
                    </button>
                </form>
            </div>

            <h2 className="text-2xl font-bold mb-6 text-slate-100 border-b border-slate-800 pb-2">Últimas Avaliações</h2>
            
            {/* LISTA DE REVIEWS */}
            <div className="flex flex-col gap-6">
                {reviews.map((review) => (
                    <div key={review.id} className="bg-[#111424] border border-slate-800 p-5 md:p-6 rounded-2xl shadow-lg flex flex-col sm:flex-row gap-5 md:gap-6 relative group">
                        
                        {/* Imagem da Mídia */}
                        {review.imagem_url && (
                            <img src={review.imagem_url} alt={review.midia} className="w-full sm:w-28 sm:h-40 object-cover rounded-xl shadow-md flex-shrink-0" />
                        )}

                        {/* Conteúdo */}
                        <div className="flex-1">
                            
                            {/* CABEÇALHO DO POST: Foto e Nome Clicável */}
                            <div className="flex items-center gap-3 mb-3">
                                <div 
                                    className="w-10 h-10 rounded-full overflow-hidden bg-slate-800 border border-slate-700 cursor-pointer hover:border-purple-500 transition-colors"
                                    onClick={() => {
                                        localStorage.setItem('perfilVisitadoID', review.usuario_id);
                                        props.setTelaAtual('perfil-publico');
                                    }}
                                >
                                    <img src={review.avatar_url || "https://api.dicebear.com/7.x/bottts/svg?seed=Gizmo"} alt="Avatar" className="w-full h-full object-cover" />
                                </div>
                                <h4 className="text-lg text-slate-300 font-medium">
                                    <span 
                                        className="font-bold text-purple-400 cursor-pointer hover:underline"
                                        onClick={() => {
                                            localStorage.setItem('perfilVisitadoID', review.usuario_id);
                                            props.setTelaAtual('perfil-publico');
                                        }}
                                    >
                                        {review.username}
                                    </span> avaliou o {review.categoria?.slice(0, -1)}: <span className="text-[#06b6d4] font-bold">{review.midia}</span>
                                </h4>
                            </div>
                            
                            <div className="inline-block bg-purple-900/30 border border-purple-500/30 text-purple-300 px-3 py-1 rounded-full text-sm font-bold mb-4">
                                Nota: {review.nota}/10
                            </div>
                            
                            {/* TEXTO DA REVIEW E BOTÕES DE EDIÇÃO */}
                            <div className="mb-4">
                                {editandoId === review.id ? (
                                    <div className="flex flex-col gap-3 mt-2 bg-[#1e2336] p-4 rounded-xl border border-slate-700">
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm text-purple-300 font-bold">Nova Nota:</span>
                                            <input 
                                                type="number" 
                                                value={notaEditada} 
                                                onChange={(e) => setNotaEditada(e.target.value)} 
                                                min="0" max="10"
                                                className="w-20 bg-[#0b0d17] border border-slate-600 rounded-lg py-1 px-2 text-slate-200 focus:outline-none focus:border-purple-500"
                                            />
                                        </div>
                                        <textarea 
                                            value={textoEditado} 
                                            onChange={(e) => setTextoEditado(e.target.value)} 
                                            rows="3"
                                            className="w-full bg-[#0b0d17] border border-slate-600 rounded-lg py-2 px-3 text-slate-200 focus:outline-none focus:border-purple-500 resize-y"
                                        />
                                        <div className="flex gap-3 mt-2">
                                            <button onClick={() => atualizarReview(review.id)} className="bg-purple-600 hover:bg-purple-500 text-white px-4 py-1.5 rounded-lg text-sm font-bold transition-colors shadow-lg">Salvar</button>
                                            <button onClick={() => setEditandoId(null)} className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-1.5 rounded-lg text-sm font-bold transition-colors">Cancelar</button>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <p className="text-slate-300 leading-relaxed text-sm md:text-base mb-3">{review.texto}</p>
                                        
                                        {String(review.usuario_id) === String(localStorage.getItem('usuarioID')) && (
                                            <div className="flex gap-4 mt-2">
                                                <button onClick={() => { setEditandoId(review.id); setTextoEditado(review.texto); setNotaEditada(review.nota); }} className="text-purple-400 hover:text-purple-300 text-sm flex items-center gap-1 transition-colors">✎ Editar</button>
                                                <button onClick={() => deletarReview(review.id)} className="text-red-400 hover:text-red-300 text-sm flex items-center gap-1 transition-colors">🗑 Excluir</button>
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>

                            {/* LIKES e CONTAGEM COMENTARIOS */}
                            <div className="mt-4 pt-4 border-t border-slate-800 flex items-center gap-6">
                                <button 
                                    onClick={() => darLike(review.id)}
                                    className={`flex items-center gap-2 text-lg font-medium transition-colors ${review.deu_like > 0 ? 'text-red-500' : 'text-slate-500 hover:text-red-400'}`}
                                >
                                    {review.deu_like > 0 ? (
                                        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                                        </svg>
                                    ) : (
                                        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                                        </svg>
                                    )}
                                    <span className="text-sm">{review.total_likes || 0}</span>
                                </button>
                                
                                <div className="flex items-center gap-2 text-slate-500">
                                    <span className="text-lg">🗨</span> 
                                    <span className="text-sm font-medium">{review.total_comentarios || 0}</span>
                                </div>
                            </div>

                            {/* COMENTARIOS */}
                            <div className="mt-2">
                                <button onClick={() => carregarComentarios(review.id)} className="text-cyan-500 hover:text-cyan-400 text-sm font-medium flex items-center gap-2 transition-colors mt-2">
                                    {comentariosAbertos[review.id] ? "Ocultar comentários" : "Ver comentários"}
                                </button>

                                {comentariosAbertos[review.id] && (
                                    <div className="mt-4 bg-[#0b0d17] border border-slate-800 p-4 rounded-xl">
                                        <div className="flex flex-col gap-3">
                                            {comentariosAbertos[review.id].length > 0 ? (
                                                comentariosAbertos[review.id].map((coment) => (
                                                    <div key={coment.id} className="flex items-start gap-2 border-b border-slate-800/60 pb-3 last:border-0 last:pb-0">
                                                        <img src={coment.avatar_url || "https://api.dicebear.com/7.x/bottts/svg?seed=Gizmo"} className="w-6 h-6 rounded-full border border-slate-700 bg-slate-800" alt="Avatar" />
                                                        <p className="text-sm text-slate-300 m-0">
                                                            <strong className="text-purple-400 mr-2">{coment.username}:</strong>{coment.texto}
                                                        </p>
                                                    </div>
                                                ))
                                            ) : ( <p className="text-sm text-slate-500 m-0">Nenhum comentário ainda.</p> )}
                                        </div>
                                        <div className="flex gap-2 mt-4 pt-3 border-t border-slate-800/60">
                                            <input type="text" placeholder="Comente algo..." value={textoComentarios[review.id] || ""} onChange={(e) => setTextoComentarios(prev => ({ ...prev, [review.id]: e.target.value }))} className="flex-1 bg-[#1e2336] border border-slate-700 rounded-lg py-2 px-3 text-sm text-slate-200 focus:outline-none focus:border-cyan-500 transition-colors" />
                                            <button onClick={() => postarComentario(review.id)} className="bg-cyan-600 hover:bg-cyan-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-lg">Enviar</button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>          
                    </div>
                ))}
            </div>
        </div>
    );
}