# Projetos de JavaScript

Repositório com os projetos desenvolvidos durante as aulas de JavaScript, com foco em manipulação do DOM, eventos, armazenamento local, consumo de APIs e renderização dinâmica de dados.

## Projetos

### 1. Cadastro de Pacientes — Manipulação do DOM

Aplicação de cadastro de pacientes com formulário, validações e tabela dinâmica.

Principais recursos:

- Cadastro de nome, e-mail, data de nascimento e telefone.
- Cálculo automático da idade.
- Validação de campos e bloqueio de e-mails duplicados.
- Busca em tempo real por nome.
- Ordenação dos pacientes por nome.
- Remoção de pacientes.
- Persistência dos dados usando `localStorage`.

🔗 [Abrir projeto](./aula01-cadastro-pacientes/index.html) · [Ver documentação](./aula01-cadastro-pacientes/README.md)

### 2. Cadastro de Pacientes — Fetch API

Evolução do projeto de cadastro, com integração entre os dados do formulário, o `localStorage` e um arquivo JSON de pacientes.

Principais recursos:

- Cadastro e listagem dinâmica de pacientes.
- Leitura de dados externos com `fetch`.
- Indicadores de quantidade de pacientes.
- Validação de registros duplicados.
- Busca, ordenação, remoção e persistência local.
- Estados de carregamento e mensagens de feedback.

🔗 [Abrir projeto](./aula02-cadastro-pacientes/index.html) · [Ver atividade](./aula02-cadastro-pacientes/aula-02-fetch-api.md)

### 3. Pokédex Interativa — PokéAPI

Aplicação web para consultar Pokémon utilizando dados da [PokéAPI](https://pokeapi.co/), com interface responsiva e detalhes completos de cada personagem.

Principais recursos:

- Cards responsivos com imagem, número, tipos, altura e peso.
- Busca por nome ou número do Pokémon.
- Carregamento progressivo da lista com `Intersection Observer`.
- Requisições assíncronas com `fetch`, `async/await` e `Promise.all`.
- Modal de detalhes em tela cheia.
- Status base, habilidades e medidas.
- Reprodução do som oficial do Pokémon.
- Sprites normais e shiny, com visualização frontal e traseira.
- Skeleton loading, tratamento de erros e navegação por teclado.

🔗 [Abrir projeto](./aula02a-poke-api/index.html) · [Ver documentação](./aula02a-poke-api/readme.md) · [Assistir à demonstração](./aula02a-poke-api/img/video.webm)

## Tecnologias utilizadas

- HTML5
- CSS3
- JavaScript (ES6+)
- Bootstrap 5
- Fetch API
- PokéAPI
- `localStorage`
- Intersection Observer API

## Como executar

Os projetos são aplicações front-end estáticas. Para executar corretamente as requisições da API e o carregamento dos arquivos JSON, abra o repositório usando um servidor local, como o **Live Server** do VS Code.

Outra opção é iniciar um servidor pelo terminal na raiz do projeto:

```bash
python3 -m http.server 5500
```

Depois, acesse [http://localhost:5500](http://localhost:5500) e escolha o projeto desejado.

## Organização do repositório

```text
.
├── aula01-cadastro-pacientes/
├── aula02-cadastro-pacientes/
├── aula02a-poke-api/
└── README.md
```

## Autor

Projeto desenvolvido por **Walyson Assis** durante as aulas de JavaScript.
