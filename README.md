# Projeto Integrador - FAM 🌍

# GeekHub

**Plataforma integrada para catalogação, avaliação e interação na cultura pop e entretenimento.**

---

## Descrição do Projeto

O **GeekHub** é um sistema de gerenciamento de informações e rede social planejado para o nicho de entretenimento, abrangendo animes, games, filmes e séries. A aplicação permite que usuários cataloguem conteúdos, registrem seu progresso de consumo e interajam através de avaliações e comentários.

O sistema resolve a problemática da volatilidade de dados em aplicações baseadas apenas em cache de navegador, substituindo o armazenamento local (LocalStorage) por uma arquitetura robusta de banco de dados relacional. Isso garante a persistência das informações, segurança e a integridade das interações em um ambiente multiusuário.

<img width="1892" height="1020" alt="image" src="https://github.com/user-attachments/assets/1f618420-e63d-4158-a94a-e97cb276ce19" />
<img width="1892" height="1017" alt="image" src="https://github.com/user-attachments/assets/514bc22c-a028-4117-a389-a9d4e7b084ec" />
<img width="1865" height="1027" alt="image" src="https://github.com/user-attachments/assets/13b0777e-318c-43ca-9fc7-62708289a64d" />
<img width="1897" height="1002" alt="image" src="https://github.com/user-attachments/assets/9c7d1fad-a838-4879-94cf-5f61d550eb86" />
<img width="1912" height="1022" alt="image" src="https://github.com/user-attachments/assets/96a7bea6-14cb-428e-a219-082846041257" />

---

## Tecnologias Utilizadas

A stack tecnológica foi selecionada visando escalabilidade e separação de responsabilidades:

* **Frontend:** React.js (Desenvolvimento de interface baseada em componentes).
* **Backend:** Node.js (Construção da API e lógica de integração).
* **Banco de Dados:** MySQL (Sistema Gerenciador de Banco de Dados Relacional).
* **Infraestrutura Cloud:** Railway (Hospedagem e provisionamento remoto do banco de dados).
---

## Funcionalidades do Sistema

| Funcionalidade | Descrição Técnica |
| :--- | :--- |
| **Autenticação** | Cadastro e login de usuários com validação de credenciais e chaves únicas. |
| **Gestão de Reviews** | Publicação de críticas detalhadas vinculadas ao perfil do autor. |
| **Manutenção de Conteúdos** | Edição dinâmica de publicações permitindo a correção de textos e notas diretamente pelo autor. |
| **Módulo Social** | Sistema de engajamento permitindo curtidas e comentários em publicações. |
| **Gestão de Backlog** | Controle de progresso individual (Status: Assistindo, Finalizado, Planejado). |
| **Avaliação Quantitativa** | Atribuição de notas (0 a 10) com validação de integridade no banco de dados. |

---

## Estrutura do Banco de Dados

A arquitetura de dados foi projetada seguindo normas de normalização para garantir a consistência das informações e a integridade referencial.

### Principais Entidades:
* **`usuarios`**: Gestão de perfis, senhas e dados de acesso.
* **`reviews`**: Registro centralizado de avaliações e mídias.
* **`comentarios`**: Entidade vinculada a usuários e reviews para suporte a discussões.
* **`likes`**: Controle de engajamento social com trava de duplicidade.
* **`minhas_listas`**: Gerenciamento de preferências e progresso individual do usuário.

### Regras de Integridade Aplicadas:
* **Unique Constraints:** Aplicação de restrições de unicidade para impedir registros duplicados em interações e catálogos pessoais.
* **Referential Integrity:** Implementação de Foreign Keys com a instrução `ON DELETE CASCADE`, garantindo que a exclusão de registros mestres remova automaticamente os dados dependentes.
* **Check Constraints:** Validação nativa para garantir que avaliações numéricas permaneçam estritamente no intervalo de 0 a 10.

---

## Integração e Armazenamento em Nuvem

O GeekHub opera com um banco de dados relacional hospedado remotamente na plataforma **Railway**.

* **Acessibilidade:** Os dados são acessíveis de forma segura pela toda a equipe técnica.
* **Segurança de Conexão:** Gestão de credenciais protegida por variáveis de ambiente (.env), ocultando detalhes sensíveis do host.
* **Sincronização:** Persistência de dados centralizada, permitindo que a sessão do usuário seja mantida independentemente do hardware utilizado no acesso.

---

## Equipe de Desenvolvimento

| Nome | RA | Função |
| :--- | :--- | :--- |
| **Karina Batista da Silva** | 20241934 | ADM Banco de Dados |
| **Henrique Ferreira Satelis** | 20241652 | Desenvolvedor Backend |
| **Henrique Brancalhão de Oliveira** | 20231302 | Desenvolvedor Frontend |

---

## Diferenciais do Projeto

* **Arquitetura Cloud-First:** Independência de servidores locais para o armazenamento de dados.
* **Segurança na Camada de Aplicação:** Verificação de autoria para operações, garantindo que apenas o criador do conteúdo possa realizar modificações nos dados persistidos.
* **Integridade de Dados:** Regras de negócio aplicadas diretamente no SGBD para prevenir inconsistências.
* **Modularidade:** Estrutura clara entre as camadas de apresentação e persistência.
* **Escalabilidade:** Pronto para expansão de volume de dados sem necessidade de reestruturação.

---
*Documentação técnica desenvolvida para fins acadêmicos e apresentação oficial de projeto.*
