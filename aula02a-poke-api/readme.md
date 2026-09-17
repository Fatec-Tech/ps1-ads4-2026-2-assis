# Pokédex Interativa

Aplicação web desenvolvida para consultar e explorar informações de Pokémon consumidas diretamente da [PokéAPI](https://pokeapi.co/). O projeto apresenta uma interface responsiva, busca por nome ou número, carregamento progressivo da lista e uma área de detalhes com informações completas do Pokémon selecionado.

## Demonstração

A animação abaixo mostra o funcionamento da aplicação:

![Demonstração da Pokédex](./img/download.gif)

## Funcionalidades

- Exibição dos Pokémon em cards responsivos.
- Carregamento progressivo dos resultados conforme o usuário navega pela página.
- Busca por nome ou número do Pokémon.
- Cards com imagem oficial, número da Pokédex, tipos, altura e peso.
- Modal de detalhes em tela cheia ao selecionar um card.
- Exibição dos status base de HP, Ataque, Defesa e Velocidade.
- Listagem das habilidades, incluindo a indicação de habilidade oculta.
- Reprodução do som oficial do Pokémon.
- Visualização de sprites normais e shiny, com versões da frente e das costas.
- Estados visuais de carregamento com skeletons.
- Mensagens amigáveis para Pokémon não encontrado ou falha na requisição.
- Interação acessível por teclado nos cards.

## Tecnologias utilizadas

- HTML5
- CSS3
- JavaScript (ES6+)
- Bootstrap 5.3
- Fetch API
- PokéAPI
- Intersection Observer API

## Como executar

Como a aplicação faz requisições para uma API externa, recomenda-se executá-la com um servidor local.

1. Clone ou baixe este repositório.
2. Abra a pasta `aula02a-poke-api` no editor.
3. Inicie um servidor local, como o **Live Server** do VS Code.
4. Acesse o endereço informado pelo servidor e interaja com a Pokédex.

Também é possível iniciar um servidor simples pelo terminal, estando dentro desta pasta:

```bash
python3 -m http.server 5500
```

Depois, abra [http://localhost:5500](http://localhost:5500) no navegador.

## Como a aplicação funciona

Ao carregar a página, a aplicação consulta a PokéAPI e busca os detalhes dos primeiros 20 Pokémon em paralelo usando `Promise.all()`. Quando o usuário se aproxima do final da lista, a `Intersection Observer API` solicita novos resultados automaticamente.

Ao clicar ou pressionar `Enter`/`Espaço` em um card, os dados do Pokémon são exibidos em um modal. As informações são renderizadas dinamicamente no DOM, e os resultados já consultados são armazenados em cache para evitar requisições repetidas.

## Estrutura do projeto

```text
aula02a-poke-api/
├── img/
│   ├── pokemon-empty-pokeball.svg
│   ├── pokebola-audio-player.svg
│   ├── download.gif
│   └── video.webm
├── js/
│   └── app.js
├── fonts/
│   └── Pokemon Solid.ttf
├── index.html
└── readme.md
```

## Destaques da implementação

- **Consumo assíncrono de API:** utilização de `fetch`, `async/await` e `Promise.all`.
- **Renderização dinâmica:** cards, stats, habilidades, sprites e controles de áudio são montados conforme os dados recebidos.
- **Experiência de uso:** skeleton loading, modal com transições, busca, feedback de erro e carregamento infinito.
- **Responsividade:** layout adaptado para diferentes tamanhos de tela utilizando Bootstrap e CSS customizado.
- **Acessibilidade:** cards navegáveis por teclado, textos alternativos nas imagens e estados informados por atributos ARIA.

## Créditos

Dados e imagens dos Pokémon são fornecidos pela [PokéAPI](https://pokeapi.co/). O projeto foi desenvolvido como atividade prática de JavaScript e consumo de APIs.
