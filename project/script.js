const formulario = document.getElementById('formLogin');
const formularioRegister = document.getElementById('formRegister')
const msgErro = document.getElementById('errorLoginMessage');


//função fazer login
formulario.addEventListener('submit', async function(event) {
    //impede que a pagina so recarregue
    event.preventDefault();
    
    const user = document.getElementById('userLogin').value;
    const pass = document.getElementById('passwordLogin').value;
    
    try {
        const resposta = await fetch ('http://localhost:3000/login', {
            method: 'POST',
            headers: { 'Content-Type' : 'application/json' },
            body: JSON.stringify({ username: user, senha: pass })
        });

        const dados = await resposta.json();

        if (dados.sucesso) {
            //guarda no local storage o id pra usar no proprio site
            localStorage.setItem('usuarioID', dados.id);
            localStorage.setItem('usuarioNick', dados.username);

            alert(`Bem vindo, ${dados.username}!`);
            // ###TODO MUDAR TELA DE LOGIN 
            window.location.href = 'logintest.html';
        } else {
            msgErro.innerText = dados.mensagem;
        }
    } catch (err) {
        msgErro.innerText = "Servidor desligado.";
    }
});

//função cadastro
formRegister.addEventListener('submit', async function(event) {
    event.preventDefault();

    const user = document.getElementById('userRegister').value;
    const pass = document.getElementById('passwordRegister').value;
    const passConfirm = document.getElementById('passwordRegisterConfirm').value;
 
    //valida se as senhas são iguais
    if (pass != passConfirm) {
        alert("Senhas diferem!");
        return;
    }

    //enviando pro banco de dados
    try {
        const resposta = await fetch('http://localhost:3000/cadastrar', {
            method: 'POST',
            headers: { 'Content-Type' : 'application/json' },
            body: JSON.stringify({ username: user, senha: pass })
        });

        const dados = await resposta.json();

        if (resposta.ok) {
            alert("Usuário criado com sucesso, ID: " + dados.id);
            alternarTela();
        } else {
            alert("Erro ao cadastrar");
        }
    } catch (err) {
        alert("Servidor do Node está desligado.");
    }
});

//alternar telas de login
function alternarTela() {
    //limpa erro
    document.getElementById('errorLoginMessage').innerText = "";

    const divLogin = document.getElementById('login-box');
    const divCadastro = document.getElementById('register-box');
    const btnSwitch = document.querySelector('#box-switch button');
    const btnLabel = document.querySelector('#box-switch label');
    
    //troca entre os divs
    if (divLogin.style.display === "none") {
        divLogin.style.display = "block";
        divCadastro.style.display = "none";
        btnSwitch.innerText = "Cadastre-se";
        btnLabel.innerText = "Novo por aqui?";
    } else {
        divLogin.style.display = "none";
        divCadastro.style.display = "block";
        btnSwitch.innerText = "Voltar ao Login";
        btnLabel.innerText = "Já é de casa?";
    }
}
