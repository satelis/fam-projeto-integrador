import { useState, useEffect } from 'react';

export default function PerfilPublico(props) {
    const [dadosUsuario, setDadosUsuario] = useState(null);
    const [reviews, setReviews] = useState([]);
    
    // Pega o ID de quem queremos visitar (que gravamos no localStorage ao clicar no Feed)
    const idVisitado = localStorage.getItem('perfilVisitadoID');

    useEffect(() => {
        const carregarPerfil = async () => {
            try {
                // Busca os dados da pessoa (Nome e Foto)
                const resUsuario = await fetch(`http://localhost:3000/usuarios/${idVisitado}`);
                if (resUsuario.ok) {
                    const dadosUser = await resUsuario.json();
                    setDadosUsuario(dadosUser);
                }

                // Busca as reviews da pessoa
                const resReviews = await fetch(`http://localhost:3000/reviews?usuario_id=${idVisitado}`);
                const dadosRev = await resReviews.json();
                setReviews(dadosRev.filter(r => String(r.usuario_id) === String(idVisitado)));
            } catch (erro) {
                console.error("Erro ao carregar perfil público:", erro);
            }
        };

        if (idVisitado) carregarPerfil();
    }, [idVisitado]);

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

            <h3 className="text-xl font-bold mb-4 text-slate-300 border-b border-slate-800 pb-2">Reviews de {dadosUsuario.username}</h3>
            <div className="flex flex-col gap-4">
                {reviews.length === 0 ? (
                    <div className="bg-[#111424] border border-slate-800 p-8 rounded-xl text-center text-slate-500">
                        Este usuário ainda não publicou nada.
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