const formulario = document.getElementById('formLogin');
const msgErro = document.getElementById('errorLoginMessage');

// ##TODO: script de criação de usuario dentro do banco de dados, com id por usuario

//função ao dar submit no login
formulario.addEventListener('submit', function(event) {
    //impede que a pagina so recarregue
    event.preventDefault();
    
    const user = document.getElementById('userLogin').value;
    const pass = document.getElementById('passwordLogin').value;

    if (user === "adm" && pass === '123') {
        window.location.href='logintest.html';
    }
    else {
        msgErro.innerText="Usuário ou senha incorretos.";
    }
});

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