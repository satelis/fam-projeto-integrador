import { useState, useEffect } from 'react';

export default function Perfil(props) {
    const usuarioNick = localStorage.getItem('usuarioNick') || "Usuário";
    const usuarioID = localStorage.getItem('usuarioID');

    // Estado para a foto de perfil (Salva no localStorage para carregamento rápido)
    const [fotoPerfil, setFotoPerfil] = useState(() => {
        return localStorage.getItem('fotoPerfil') || "https://api.dicebear.com/7.x/bottts/svg?seed=Gizmo";
    });

    const [reviews, setReviews] = useState([]);
    const [modalAberto, setModalAberto] = useState(false);

    const avataresDisponiveis = [
        "https://api.dicebear.com/7.x/bottts/svg?seed=Gizmo",
        "https://api.dicebear.com/7.x/bottts/svg?seed=Caleb",
        "https://api.dicebear.com/7.x/bottts/svg?seed=Zoe",
        "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix",
        "https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka",
        "https://api.dicebear.com/7.x/avataaars/svg?seed=Jocelyn",
        "https://api.dicebear.com/7.x/adventurer/svg?seed=Destiny",
        "https://api.dicebear.com/7.x/adventurer/svg?seed=Midnight",
    ];

    useEffect(() => {
        const carregarMinhasReviews = async () => {
            try {
                const resposta = await fetch(`http://localhost:3000/reviews?usuario_id=${usuarioID}`);
                const dados = await resposta.json();
                const minhasReviews = dados.filter(r => String(r.usuario_id) === String(usuarioID));
                setReviews(minhasReviews);
            } catch (erro) {
                console.error("Erro ao carregar reviews do perfil:", erro);
            }
        };
        if (usuarioID) carregarMinhasReviews();
    }, [usuarioID]);

    const mudarFoto = async (novaFoto) => {
        try {
            // Salva a foto no banco de dados
            const resposta = await fetch(`http://localhost:3000/usuarios/${usuarioID}/avatar`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ avatar_url: novaFoto })
            });

            if (resposta.ok) {
                setFotoPerfil(novaFoto);
                localStorage.setItem('fotoPerfil', novaFoto); 
                setModalAberto(false);
            } else {
                alert("Erro ao salvar foto no servidor.");
            }
        } catch (erro) {
            console.error("Erro na conexão:", erro);
        }
    };

    return (
        <div className="w-full max-w-5xl mx-auto p-4 md:p-8 text-slate-200 font-sans relative">
            <div className="bg-[#111424] border border-slate-800 p-8 rounded-2xl mb-8 shadow-xl flex flex-col md:flex-row items-center gap-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-purple-600/20 to-cyan-600/20 blur-3xl rounded-full pointer-events-none"></div>

                <div className="flex flex-col items-center gap-4 z-10">
                    <div className="relative group">
                        <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-[#1e2336] shadow-[0_0_20px_rgba(147,51,234,0.4)] bg-slate-800">
                            <img src={fotoPerfil} alt="Avatar do Usuário" className="w-full h-full object-cover" />
                        </div>
                        <div 
                            onClick={() => setModalAberto(true)}
                            className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                        >
                            <span className="text-white text-sm font-bold text-center">Alterar<br/>Foto</span>
                        </div>
                    </div>
                    <button onClick={() => setModalAberto(true)} className="text-sm font-semibold text-cyan-400 hover:text-cyan-300 transition-colors">
                        Trocar Avatar
                    </button>
                </div>

                <div className="text-center md:text-left z-10 flex-1">
                    <h2 className="text-4xl font-black mb-2 text-transparent bg-clip-text bg-gradient-to-r from-[#d946ef] to-[#06b6d4]">
                        {usuarioNick}
                    </h2>
                    <p className="text-slate-400 font-medium text-lg mb-4">Meu Perfil GeekHub</p>
                    
                    <div className="flex justify-center md:justify-start gap-6">
                        <div className="bg-[#1e2336] px-4 py-2 rounded-xl border border-slate-700/50 text-center">
                            <span className="block text-2xl font-bold text-slate-200">{reviews.length}</span>
                            <span className="text-xs text-slate-500 uppercase tracking-wider font-bold">Minhas Reviews</span>
                        </div>
                    </div>
                </div>
            </div>

            <h3 className="text-xl font-bold mb-4 text-slate-300">Minhas Listas</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
                {[
                    { nome: 'Animes', icone: '🎌', rota: 'lista-animes', cor: 'from-orange-500/20 to-red-500/20', borda: 'group-hover:border-orange-500/50' },
                    { nome: 'Filmes', icone: '🎬', rota: 'lista-filmes', cor: 'from-blue-500/20 to-cyan-500/20', borda: 'group-hover:border-cyan-500/50' },
                    { nome: 'Séries', icone: '📺', rota: 'lista-series', cor: 'from-green-500/20 to-emerald-500/20', borda: 'group-hover:border-emerald-500/50' },
                    { nome: 'Jogos', icone: '🎮', rota: 'lista-jogos', cor: 'from-purple-500/20 to-pink-500/20', borda: 'group-hover:border-purple-500/50' }
                ].map((lista) => (
                    <button 
                        key={lista.nome}
                        onClick={() => props.setTelaAtual(lista.rota)}
                        className={`group bg-[#111424] border border-slate-800 p-4 rounded-xl flex flex-col items-center justify-center gap-2 transition-all hover:bg-gradient-to-br ${lista.cor} ${lista.borda} hover:-translate-y-1`}
                    >
                        <span className="text-3xl">{lista.icone}</span>
                        <span className="font-bold text-slate-300 group-hover:text-white">{lista.nome}</span>
                    </button>
                ))}
            </div>

            <h3 className="text-xl font-bold mb-4 text-slate-300 border-b border-slate-800 pb-2">Meu Histórico de Reviews</h3>
            <div className="flex flex-col gap-4">
                {reviews.length === 0 ? (
                    <div className="bg-[#111424] border border-slate-800 p-8 rounded-xl text-center text-slate-500">
                        Você ainda não publicou nenhuma avaliação.
                    </div>
                ) : (
                    reviews.map((review) => (
                        <div key={review.id} className="bg-[#111424] border border-slate-800 p-4 rounded-xl flex gap-4 items-start">
                            {review.imagem_url ? (
                                <img src={review.imagem_url} alt={review.midia} className="w-16 h-24 object-cover rounded-md shadow-md flex-shrink-0" />
                            ) : (
                                <div className="w-16 h-24 bg-slate-800 rounded-md flex-shrink-0"></div>
                            )}
                            <div className="flex-1">
                                <h4 className="text-slate-200 font-bold mb-1">
                                    {review.midia} <span className="text-xs text-slate-500 font-normal ml-2 px-2 py-0.5 bg-slate-800 rounded-full">{review.categoria?.slice(0, -1)}</span>
                                </h4>
                                <div className="text-purple-400 text-sm font-bold mb-2">Nota: {review.nota}/10</div>
                                <p className="text-slate-400 text-sm italic">"{review.texto}"</p>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* MODAL AVATAR */}
            {modalAberto && (
                <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-[#111424] border border-slate-700 p-6 rounded-2xl max-w-2xl w-full shadow-2xl">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-2xl font-bold text-white">Escolha seu Avatar</h3>
                            <button onClick={() => setModalAberto(false)} className="text-slate-400 hover:text-white text-2xl font-bold">&times;</button>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                            {avataresDisponiveis.map((avatar, index) => (
                                <div 
                                    key={index} onClick={() => mudarFoto(avatar)}
                                    className={`cursor-pointer rounded-xl p-2 border-2 transition-all hover:scale-105 ${fotoPerfil === avatar ? 'border-purple-500 bg-purple-500/10' : 'border-slate-800 bg-[#1e2336] hover:border-slate-500'}`}
                                >
                                    <img src={avatar} alt="Avatar" className="w-full h-auto rounded-lg" />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}