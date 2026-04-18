//importa script de conexão com o sql
const db = require('./db');

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