import { useState } from 'react';

export default function Login(props) {
    const [usuario, setUsuario] = useState('');
    const [senha, setSenha] = useState('');
    const [erro, setErro] = useState('');

    const fazerLogin = async (evento) => {
        evento.preventDefault(); 
        setErro('');

        try {
            const resposta = await fetch('http://localhost:3000/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username: usuario, senha: senha })
            });

            const dados = await resposta.json();

            if (resposta.ok && dados.sucesso) {
                // se der sucesso salva tudo no navegador
                localStorage.setItem('usuarioID', dados.id);
                localStorage.setItem('usuarioNick', dados.username);

                console.log("Acesso OK. ID " + dados.id);
                props.onLoginSucesso(); 
            } else {
                setErro(dados.mensagem || "Usuário ou senha incorretos.");
            }
        } catch (err) {
            setErro("Servidor Node desligado.");
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-[#070913] text-white font-sans relative overflow-hidden">
            
            {/* Efeito de brilho de fundo */}
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-900/20 rounded-full blur-[120px]"></div>
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-900/10 rounded-full blur-[120px]"></div>

            {/* LOGO GEEKHUB */}
            <h1 className="text-5xl font-black mb-8 z-10 tracking-tight">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#d946ef] to-[#06b6d4]">
                    GeekHub
                </span>
            </h1>

            {/* CARTÃO DE LOGIN */}
            <div className="bg-[#111424] border border-slate-800 p-8 rounded-2xl w-full max-w-md shadow-2xl z-10">
                <form onSubmit={fazerLogin} className="flex flex-col gap-5">
                    
                    {/* CAMPO USERNAME */}
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-medium text-slate-300">Username</label>
                        <div className="relative">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
                                    <circle cx="12" cy="7" r="4"></circle>
                                </svg>
                            </div>
                            <input 
                                type="text" 
                                placeholder="Seu username"
                                value={usuario}
                                onChange={(e) => setUsuario(e.target.value)}
                                className="w-full bg-[#0b0d17] border border-slate-800 rounded-xl py-3 pl-11 pr-4 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
                            />
                        </div>
                    </div>

                    {/* CAMPO SENHA */}
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-medium text-slate-300">Senha</label>
                        <div className="relative">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                                    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                                </svg>
                            </div>
                            <input 
                                type="password" 
                                placeholder="••••••••"
                                value={senha}
                                onChange={(e) => setSenha(e.target.value)}
                                className="w-full bg-[#0b0d17] border border-slate-800 rounded-xl py-3 pl-11 pr-4 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
                            />
                        </div>
                    </div>

                    {/* EXIBIÇÃO DE ERRO */}
                    {erro && (
                        <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm p-3 rounded-lg flex items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="12" cy="12" r="10"></circle>
                                <line x1="12" y1="8" x2="12" y2="12"></line>
                                <line x1="12" y1="16" x2="12.01" y2="16"></line>
                            </svg>
                            {erro}
                        </div>
                    )}

                    {/* BOTÃO ENTRAR */}
                    <button 
                        type="submit" 
                        className="w-full mt-2 bg-gradient-to-r from-[#9333ea] to-[#6366f1] text-white font-bold rounded-xl py-3.5 flex justify-center items-center gap-2 hover:opacity-90 transition-opacity shadow-[0_0_20px_rgba(147,51,234,0.3)]"
                    >
                        Entrar 
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M5 12h14"></path>
                            <path d="m12 5 7 7-7 7"></path>
                        </svg>
                    </button>
                </form>

                {/* DIVISÓRIA */}
                <div className="flex items-center my-6">
                    <div className="flex-1 border-t border-slate-800"></div>
                    <span className="px-4 text-xs font-medium text-slate-400">Novo por aqui?</span>
                    <div className="flex-1 border-t border-slate-800"></div>
                </div>

                {/* BOTÃO CADASTRAR */}
                <button 
                    type="button"
                    onClick={props.onIrParaCadastro}
                    className="w-full bg-[#1e2336] text-slate-300 font-semibold rounded-xl py-3.5 hover:bg-[#2a3047] hover:text-white transition-colors border border-slate-700"
                >
                    Cadastre-se
                </button>
            </div>

            {/* RODAPÉ */}
            <div className="mt-10 max-w-md text-center z-10">
                <p className="text-slate-400 text-sm leading-relaxed">
                    O <strong className="text-slate-200">GeekHub</strong> é uma comunidade para entusiastas de cultura pop, animes e games. Conecte-se e compartilhe suas ideias com outros usuários nesta rede pensada de fã para fã.
                </p>
                <div className="flex justify-center items-center gap-4 mt-6 text-slate-500">
                    <span className="font-mono font-bold">&lt; &gt;</span>
                    <span className="font-mono font-bold">&gt;_</span>
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="6" y1="12" x2="10" y2="12"></line>
                        <line x1="8" y1="10" x2="8" y2="14"></line>
                        <line x1="15" y1="13" x2="15.01" y2="13"></line>
                        <line x1="18" y1="11" x2="18.01" y2="11"></line>
                        <rect x="2" y="6" width="20" height="12" rx="2"></rect>
                    </svg>
                </div>
            </div>

        </div>
    );
}