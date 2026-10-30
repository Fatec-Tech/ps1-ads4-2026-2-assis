# Atividade 07 — CRUD de Pacientes com Express e Deploy no Render

Sistema de cadastro de pacientes onde dá para **criar, listar, editar e excluir** pacientes pelo navegador. Ele tem duas partes:

- **Backend (API):** um servidor Node.js com Express que guarda e devolve os dados dos pacientes.
- **Frontend (site):** uma página HTML que conversa com a API e mostra os pacientes numa tabela.

As duas partes estão publicadas na internet, no Render.

## Links do projeto no ar

| O quê | Link |
|---|---|
| Site (frontend) | https://app-clinica-walysonassis.onrender.com |
| API (backend) | https://api-clinica-walysonassis.onrender.com/pacientes |

> **Atenção:** o plano gratuito do Render "dorme" quando ninguém usa o serviço por um tempo. O primeiro acesso depois disso pode levar até um minuto para responder. Isso é normal.

## O que é um CRUD?

CRUD são as quatro operações básicas de qualquer cadastro:

| Letra | Significado | O que faz no sistema | Método HTTP |
|---|---|---|---|
| **C** | Create (criar) | Cadastrar um paciente novo | `POST` |
| **R** | Read (ler) | Listar os pacientes ou buscar um | `GET` |
| **U** | Update (atualizar) | Editar os dados de um paciente | `PUT` |
| **D** | Delete (excluir) | Remover um paciente | `DELETE` |

## Como o sistema funciona

```
  Navegador (site)                         Servidor (API)
 ┌──────────────────┐   fetch (JSON)     ┌──────────────────────┐
 │ index.html       │ ─────────────────► │ Express (server.js)  │
 │ app.js           │ ◄───────────────── │ array de pacientes   │
 └──────────────────┘   resposta JSON    └──────────────────────┘
```

1. A pessoa preenche o formulário ou clica em **Editar** / **Excluir**.
2. O `app.js` envia uma requisição para a API usando `fetch`.
3. A API faz a operação no array de pacientes e responde com JSON e um **código de status** (200, 201, 204, 400 ou 404).
4. O site atualiza a tabela e o total de pacientes.

## Estrutura de pastas

```
atividade07-CRUD/
├── backend/
│   ├── server.js        → a API (todas as rotas do CRUD)
│   └── package.json     → dependências (express e cors) e o comando "npm start"
├── frontend/
│   ├── index.html       → a página com o formulário e a tabela
│   ├── css/style.css    → estilos
│   └── js/app.js        → conversa com a API (fetch) e monta a tabela
├── docs/
│   ├── OQUEPRECISASERFEITO.md → orientações de entrega do professor
│   ├── PRD.md                 → documento com os requisitos da aula
│   └── ISSUES.md              → as tarefas (issues) planejadas para a entrega
└── readme.md            → este arquivo

../render.yaml           → configuração do deploy no Render (fica na raiz do repositório)
```

## Rotas da API

Endereço base: `/pacientes`. Todos os dados vão e voltam em JSON.

| Método | Rota | O que faz | Sucesso | Erros possíveis |
|---|---|---|---|---|
| `GET` | `/pacientes` | Lista todos os pacientes | `200` | — |
| `GET` | `/pacientes/total` | Mostra quantos pacientes existem | `200` | — |
| `GET` | `/pacientes/:id` | Busca um paciente pelo ID | `200` | `404` se não existir |
| `POST` | `/pacientes` | Cadastra um paciente | `201` | `400` se faltar nome, email ou nascimento |
| `PUT` | `/pacientes/:id` | Atualiza um paciente | `200` | `404` se não existir · `400` se faltar campo |
| `DELETE` | `/pacientes/:id` | Exclui um paciente | `204` (sem corpo) | `404` se não existir |

Exemplo de corpo para `POST` e `PUT`:

```json
{
  "nome": "Paciente Exemplo",
  "email": "exemplo@email.com",
  "nascimento": "2000-01-01"
}
```

**O que cada código de status significa:**

- `200 OK`: deu certo e a resposta traz dados.
- `201 Created`: um paciente novo foi criado.
- `204 No Content`: deu certo, mas não há nada para devolver (usado na exclusão).
- `400 Bad Request`: a requisição veio com dados faltando.
- `404 Not Found`: o paciente (ou a rota) não existe.

## Como rodar no seu computador

Pré-requisito: ter o [Node.js](https://nodejs.org) instalado (versão 18 ou mais nova).

**1. Inicie o backend**

```bash
cd atividade07-CRUD/backend
npm install      # baixa o express e o cors
npm start        # inicia a API em http://localhost:3000
```

**2. Aponte o frontend para a API local**

Abra `frontend/js/app.js` e troque a primeira linha de código:

```js
// Em produção (já vem assim):
const URL_API = 'https://api-clinica-walysonassis.onrender.com/pacientes';

// Para testar localmente, use:
const URL_API = 'http://localhost:3000/pacientes';
```

**3. Abra o site**

Abra o arquivo `frontend/index.html` no navegador (ou use a extensão Live Server do VS Code).

> Lembre de voltar a `URL_API` para o endereço do Render antes de fazer commit, senão o site publicado vai tentar acessar o seu computador.

## Os dados ficam em memória

Os pacientes ficam guardados num **array dentro do `server.js`**, e não num banco de dados. Na prática:

- Tudo o que você cadastrar, editar ou excluir **some quando o servidor reinicia**.
- No Render isso acontece com frequência, porque o serviço gratuito dorme quando fica parado e também reinicia a cada novo deploy.
- Depois de reiniciar, a lista volta a ter os 4 pacientes iniciais.

Essa limitação é proposital nesta etapa. Na próxima aula o array será trocado por um banco PostgreSQL.

> **Use apenas dados fictícios.** Este é um projeto de estudo, então nunca cadastre nomes, e-mails ou datas de pessoas reais.

## Deploy no Render e o arquivo `render.yaml`

### O que é o `render.yaml`?

É um arquivo de configuração chamado **Blueprint**. Em vez de criar cada serviço clicando no painel do Render e preenchendo formulários, a gente descreve tudo num arquivo de texto, e o Render cria os serviços sozinho a partir dele.

### Por que usamos ele?

- **Tudo num lugar só:** backend e frontend são configurados juntos, no mesmo arquivo.
- **Fica salvo no repositório:** qualquer pessoa vê exatamente como o deploy foi feito, e dá para refazer tudo do zero.
- **Menos erro manual:** não é preciso lembrar qual pasta, qual comando ou qual opção foi escolhida no painel.
- **Deploy automático:** a cada `git push` na `main`, o Render atualiza os serviços.

### O que o nosso `render.yaml` diz

Ele fica na **raiz do repositório** (`../render.yaml`), porque o Render procura o Blueprint ali. Ele cria dois serviços:

| Serviço | Tipo | O que faz |
|---|---|---|
| `api-clinica-walysonassis` | Web Service (Node) | Entra em `atividade07-CRUD/backend`, roda `npm install` e depois `npm start` |
| `app-clinica-walysonassis` | Static Site | Publica os arquivos da pasta `atividade07-CRUD/frontend` como um site estático |

Detalhes importantes:

- `plan: free`: usa o plano gratuito.
- `rootDir`: diz em qual pasta está o backend, já que o repositório tem vários projetos.
- `staticPublishPath`: diz qual pasta do frontend vai para o ar.
- `buildFilter`: o site só é publicado de novo quando algo muda dentro de `frontend/`, e não a cada alteração em outras aulas.
- O frontend não tem etapa de build (é HTML, CSS e JS puros), então o `buildCommand` só imprime uma mensagem.
- O backend usa `process.env.PORT || 3000`, porque o Render escolhe a porta e a informa por essa variável de ambiente.

### Um problema que aconteceu (e como foi resolvido)

No primeiro deploy, o Render recusou o Blueprint com o erro `mapping values are not allowed in this context`. A causa foi esta linha:

```yaml
buildCommand: echo "Sem build: arquivos estáticos"
```

No YAML, um texto sem aspas que tem `: ` (dois-pontos e espaço) no meio é lido como se fosse uma nova chave. A correção foi colocar o comando inteiro entre aspas simples:

```yaml
buildCommand: 'echo "Sem build: arquivos estáticos"'
```

## Como o projeto foi feito (com ajuda do Claude)

Este projeto foi desenvolvido com o apoio do **Claude** (assistente de IA da Anthropic), usado pelo **Claude Code** no terminal e no VS Code. Ele ajudou em três frentes:

### 1. Planejamento com issues

A partir das [orientações do professor](docs/OQUEPRECISASERFEITO.md) e do [PRD](docs/PRD.md), o Claude ajudou a quebrar o trabalho em **10 issues** pequenas, cada uma com descrição e critérios de aceite. Elas estão em [docs/ISSUES.md](docs/ISSUES.md) e foram cadastradas no GitHub.

| Issue | Tarefa | Issue no GitHub |
|---|---|---|
| I01 | Migrar o servidor HTTP para Express | #9 |
| I02 | Listagem e busca de pacientes por ID | #10 |
| I03 | Cadastro de pacientes pela API (`POST`) | #11 |
| I04 | Atualização de pacientes pela API (`PUT`) | #12 |
| I05 | Exclusão de pacientes pela API (`DELETE`) | #13 |
| I06 | Integrar listagem e cadastro do frontend com a API | #14 |
| I07 | Edição de pacientes no frontend | #15 |
| I08 | Exclusão de pacientes no frontend | #16 |
| I09 | Publicar backend e frontend no Render | #17 |
| I10 | Validar a entrega e documentar (este README) | — |

### 2. Commits organizados

Cada issue virou **um commit**, seguindo o padrão *Conventional Commits* (`tipo(área): descrição #issue`). Assim o histórico conta a história do projeto passo a passo:

```
b4d3a99 fix(deploy): corrigir YAML do buildCommand no render.yaml
f247acd feat(deploy): configurar publicação no Render #17
a255ee7 feat(frontend): implementar exclusão de pacientes #16
3846e7f feat(frontend): implementar edição de pacientes #15
4021110 feat(frontend): integrar listagem e cadastro com a API #14
edbb10d feat(backend): implementar exclusão de pacientes via DELETE #13
792c195 feat(backend): implementar atualização de pacientes via PUT #12
583baa1 feat(backend): implementar cadastro de pacientes via POST #11
7c2854f feat(backend): implementar busca de paciente por ID #10
06de87e feat(backend): migrar servidor HTTP para Express #9
```

- `feat`: funcionalidade nova.
- `fix`: correção de um problema.
- `(backend)`, `(frontend)`, `(deploy)`: em qual parte do projeto foi a mudança.
- `#número`: liga o commit à issue correspondente no GitHub.

### 3. Deploy com o plugin do Render

O deploy foi feito com o **plugin oficial do Render para o Claude Code**. O plugin ajudou a gerar o `render.yaml`, publicar os dois serviços e, quando o Render apontou o erro no YAML, a encontrar e corrigir a causa.

## Testes realizados

Todas as rotas foram testadas com `curl`, tanto **localmente** (`http://localhost:3000`) quanto **em produção** (Render), em 29/10/2026. Os testes usaram um paciente fictício, que foi criado, editado e excluído em seguida.

| # | Teste | Esperado | Local | Produção |
|---|---|---|---|---|
| 1 | `GET /pacientes` (listar) | `200` | ✅ 200 | ✅ 200 |
| 2 | `GET /pacientes/1` (buscar por ID) | `200` | ✅ 200 | ✅ 200 |
| 3 | `GET /pacientes/total` | `200` | ✅ 200 | ✅ 200 |
| 4 | `POST /pacientes` com dados completos | `201` | ✅ 201 | ✅ 201 |
| 5 | `PUT /pacientes/:id` do paciente criado | `200` | ✅ 200 | ✅ 200 |
| 6 | `DELETE /pacientes/:id` do paciente criado | `204` sem corpo | ✅ 204 (0 bytes) | ✅ 204 (0 bytes) |
| 7 | `POST /pacientes` com corpo vazio | `400` | ✅ 400 | ✅ 400 |
| 8 | `PUT /pacientes/1` sem os campos obrigatórios | `400` | ✅ 400 | ✅ 400 |
| 9 | `GET /pacientes/999` (não existe) | `404` | ✅ 404 | ✅ 404 |
| 10 | `PUT /pacientes/999` (não existe) | `404` | ✅ 404 | ✅ 404 |
| 11 | `DELETE /pacientes/999` (não existe) | `404` | ✅ 404 | ✅ 404 |

Também foi conferido em produção que:

- o site publicado carrega o HTML, o CSS e o JavaScript corretamente;
- a API responde com o cabeçalho `Access-Control-Allow-Origin: *`, então o site consegue acessar a API sem erro de CORS;
- pelo navegador, o fluxo completo funciona: cadastrar, editar, cancelar a edição e excluir.

### Como repetir os testes

Troque `BASE` pelo endereço que quer testar (local ou Render):

```bash
BASE=https://api-clinica-walysonassis.onrender.com/pacientes

# Listar
curl $BASE

# Cadastrar
curl -X POST $BASE -H "Content-Type: application/json" \
  -d '{"nome":"Paciente Teste","email":"teste@exemplo.com","nascimento":"2000-01-01"}'

# Atualizar (troque 5 pelo id retornado no cadastro)
curl -X PUT $BASE/5 -H "Content-Type: application/json" \
  -d '{"nome":"Paciente Editado","email":"editado@exemplo.com","nascimento":"2000-02-02"}'

# Excluir
curl -i -X DELETE $BASE/5

# Erro 400: corpo vazio
curl -i -X POST $BASE

# Erro 404: paciente que não existe
curl -i $BASE/999
```

## Tecnologias usadas

- **Node.js** + **Express 5**: servidor e rotas da API.
- **cors**: deixa o site (em outro endereço) acessar a API.
- **HTML, CSS, JavaScript** + **Bootstrap 5**: interface do site.
- **Fetch API**: comunicação do site com a API.
- **Render**: hospedagem gratuita do backend e do frontend.
- **Claude Code** + **plugin do Render**: planejamento, commits e deploy.
