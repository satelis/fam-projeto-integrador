import { useState, useEffect } from 'react';

export default function PerfilPublico(props) {
    const [dadosUsuario, setDadosUsuario] = useState(null);
    const [reviews, setReviews] = useState([]);
    
    // Estados para gerenciar a exibição das listas do outro usuário
    const [categoriaAtiva, setCategoriaAtiva] = useState(null); // 'Animes', 'Filmes', etc.
    const [itensLista, setItensLista] = useState([]);

    // Pega o ID de quem queremos visitar
    const idVisitado = localStorage.getItem('perfilVisitadoID');

    // 1. Carrega os dados básicos e as reviews do usuário visitado
    useEffect(() => {
        const carregarPerfil = async () => {
            try {
                const resUsuario = await fetch(`http://localhost:3000/usuarios/${idVisitado}`);
                if (resUsuario.ok) {
                    const dadosUser = await resUsuario.json();
                    setDadosUsuario(dadosUser);
                }

                const resReviews = await fetch(`http://localhost:3000/reviews?usuario_id=${idVisitado}`);
                const dadosRev = await resReviews.json();
                setReviews(dadosRev.filter(r => String(r.usuario_id) === String(idVisitado)));
            } catch (erro) {
                console.error("Erro ao carregar perfil público:", erro);
            }
        };

        if (idVisitado) carregarPerfil();
    }, [idVisitado]);

    // 2. Carrega os itens da lista da categoria selecionada
    useEffect(() => {
        const carregarListaDoUsuario = async () => {
            if (!categoriaAtiva) return;
            try {
                const resposta = await fetch(`http://localhost:3000/lista/${idVisitado}/${categoriaAtiva}`);
                const dados = await resposta.json();
                if (Array.isArray(dados)) {
                    setItensLista(dados);
                }
            } catch (erro) {
                console.error("Erro ao carregar lista do usuário:", erro);
            }
        };

        carregarListaDoUsuario();
    }, [categoriaAtiva, idVisitado]);

    if (!dadosUsuario) return <div className="p-8 text-white">Carregando perfil...</div>;

    return (
        <div className="w-full max-w-5xl mx-auto p-4 md:p-8 text-slate-200 font-sans relative">
            
            {/* Botão de voltar */}
            <button 
                onClick={() => props.setTelaAtual('feed')}
                className="mb-6 text-slate-400 hover:text-white font-medium flex items-center gap-2 transition-colors"
            >
                ← Voltar para o Feed
            </button>

            {/* CARD DO PERFIL */}
            <div className="bg-[#111424] border border-slate-800 p-8 rounded-2xl mb-8 shadow-xl flex flex-col md:flex-row items-center gap-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-purple-600/20 to-cyan-600/20 blur-3xl rounded-full pointer-events-none"></div>

                <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-[#1e2336] shadow-[0_0_20px_rgba(147,51,234,0.4)] bg-slate-800 z-10">
                    <img src={dadosUsuario.avatar_url || "https://api.dicebear.com/7.x/bottts/svg?seed=Gizmo"} alt="Avatar" className="w-full h-full object-cover" />
                </div>

                <div className="text-center md:text-left z-10 flex-1">
                    <h2 className="text-4xl font-black mb-2 text-transparent bg-clip-text bg-gradient-to-r from-[#d946ef] to-[#06b6d4]">
                        {dadosUsuario.username}
                    </h2>
                    <p className="text-slate-400 font-medium text-lg mb-4">Membro do GeekHub</p>
                    
                    <div className="flex justify-center md:justify-start gap-6">
                        <div className="bg-[#1e2336] px-4 py-2 rounded-xl border border-slate-700/50 text-center">
                            <span className="block text-2xl font-bold text-slate-200">{reviews.length}</span>
                            <span className="text-xs text-slate-500 uppercase tracking-wider font-bold">Reviews Publicadas</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* SEÇÃO DE LISTAS DO USUÁRIO VISITADO */}
            <h3 className="text-xl font-bold mb-4 text-slate-300">Listas de {dadosUsuario.username}</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                {[
                    { nome: 'Animes', icone: '🎌', cor: 'from-orange-500/20 to-red-500/20', borda: 'hover:border-orange-500/50', ativoClass: 'border-orange-500 bg-orange-500/10' },
                    { nome: 'Filmes', icone: '🎬', cor: 'from-blue-500/20 to-cyan-500/20', borda: 'hover:border-cyan-500/50', ativoClass: 'border-cyan-500 bg-cyan-500/10' },
                    { nome: 'Séries', icone: '📺', cor: 'from-green-500/20 to-emerald-500/20', borda: 'hover:border-emerald-500/50', ativoClass: 'border-emerald-500 bg-emerald-500/10' },
                    { nome: 'Jogos', icone: '🎮', cor: 'from-purple-500/20 to-pink-500/20', borda: 'hover:border-purple-500/50', ativoClass: 'border-purple-500 bg-purple-500/10' }
                ].map((lista) => {
                    const estaAtivo = categoriaAtiva === lista.nome;
                    return (
                        <button 
                            key={lista.nome}
                            onClick={() => setCategoriaAtiva(estaAtivo ? null : lista.nome)} // Clicar de novo fecha a aba
                            className={`group bg-[#111424] p-4 rounded-xl flex flex-col items-center justify-center gap-2 transition-all border ${estaAtivo ? lista.ativoClass : 'border-slate-800'} hover:bg-gradient-to-br ${lista.cor} ${lista.borda}`}
                        >
                            <span className="text-3xl">{lista.icone}</span>
                            <span className="font-bold text-slate-300 group-hover:text-white">{lista.nome}</span>
                        </button>
                    );
                })}
            </div>

            {/* EXIBIÇÃO DA TABELA DA LISTA (Se alguma aba estiver aberta) */}
            {categoriaAtiva && (
                <div className="bg-[#111424] border border-slate-800 rounded-2xl overflow-hidden shadow-xl mb-10 transition-all animate-fadeIn">
                    <div className="p-4 bg-[#1e2336] border-b border-slate-800 flex justify-between items-center">
                        <span className="font-bold text-slate-200">Catalogados em: {categoriaAtiva}</span>
                        <button onClick={() => setCategoriaAtiva(null)} className="text-sm text-slate-400 hover:text-white">Fechar lista ✕</button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse min-w-[500px]">
                            <thead className="text-slate-500 text-xs uppercase tracking-wider border-b border-slate-800/60 bg-[#0f111e]">
                                <tr>
                                    <th className="p-4 font-semibold">Capa</th>
                                    <th className="p-4 font-semibold">Título</th>
                                    <th className="p-4 font-semibold">Status</th>
                                    <th className="p-4 font-semibold">Nota</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/40">
                                {itensLista.length === 0 ? (
                                    <tr>
                                        <td colSpan="4" className="p-8 text-center text-slate-500 text-sm">
                                            Este usuário ainda não adicionou nenhum item nesta lista.
                                        </td>
                                    </tr>
                                ) : (
                                    itensLista.map((item) => (
                                        <tr key={item.id} className="hover:bg-[#15192b]/40 transition-colors">
                                            <td className="p-4 w-20">
                                                {item.imagem_url ? (
                                                    <img src={item.imagem_url} alt="Capa" className="w-10 h-14 object-cover rounded-lg shadow-md" />
                                                ) : (
                                                    <div className="w-10 h-14 bg-slate-800 rounded-lg"></div>
                                                )}
                                            </td>
                                            <td className="p-4 font-bold text-slate-200">{item.titulo}</td>
                                            <td className="p-4">
                                                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-[#1e2336] text-purple-300 border border-purple-500/20">
                                                    {item.status_consumo}
                                                </span>
                                            </td>
                                            <td className="p-4 font-semibold text-amber-400">
                                                {item.nota_pessoal > 0 ? `★ ${item.nota_pessoal}/10` : 'Sem nota'}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* HISTÓRICO DE REVIEWS */}
            <h3 className="text-xl font-bold mb-4 text-slate-300 border-b border-slate-800 pb-2">Reviews de {dadosUsuario.username}</h3>
            <div className="flex flex-col gap-4">
                {reviews.length === 0 ? (
                    <div className="bg-[#111424] border border-slate-800 p-8 rounded-xl text-center text-slate-500">
                        Este usuário ainda não publicou nenhuma avaliação.
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
        </div>
    );
}