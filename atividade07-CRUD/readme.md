# Atividade 07 — CRUD de Pacientes com Express e Deploy no Render

Sistema de cadastro de pacientes onde dá para **criar, listar, editar e excluir** pacientes pelo navegador. Ele tem duas partes:

- **Backend (API):** um servidor Node.js com Express que guarda e consulta os pacientes no PostgreSQL do Supabase.
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
 │ app.js           │ ◄───────────────── │ PostgreSQL / Supabase │
 └──────────────────┘   resposta JSON    └──────────────────────┘
```

1. A pessoa preenche o formulário ou clica em **Editar** / **Excluir**.
2. O `app.js` envia uma requisição para a API usando `fetch`.
3. A API executa uma consulta SQL parametrizada no Supabase e responde com JSON e um **código de status**.
4. O site atualiza a tabela e o total de pacientes.

## Estrutura de pastas

```
atividade07-CRUD/
├── backend/
│   ├── server.js        → a API (todas as rotas do CRUD)
│   ├── banco.js         → pool de conexões PostgreSQL e tratamento de datas
│   ├── .env.example     → modelo sem senha para a configuração local
│   ├── scripts/         → schema inicial, migrações ALTER TABLE e reset
│   └── package.json     → dependências (express, cors e pg) e comandos npm
├── frontend/
│   ├── index.html       → a página com o formulário e a tabela
│   ├── css/style.css    → estilos
│   └── js/app.js        → conversa com a API (fetch) e monta a tabela
└── readme.md            → este arquivo

../render.yaml           → configuração do deploy no Render (fica na raiz do repositório)
```

## Rotas da API

Endereço base: `/pacientes`. Todos os dados vão e voltam em JSON.

| Método | Rota | O que faz | Sucesso | Erros possíveis |
|---|---|---|---|---|
| `GET` | `/pacientes` | Lista todos os pacientes | `200` | — |
| `GET` | `/pacientes?nome=ana` | Lista só os pacientes cujo nome contém o texto (sem diferenciar maiúsculas/minúsculas) | `200` (lista vazia se ninguém bater) | — |
| `GET` | `/pacientes/total` | Mostra quantos pacientes existem | `200` | — |
| `GET` | `/pacientes/:id` | Busca um paciente pelo ID | `200` | `400` se o ID for inválido · `404` se não existir |
| `POST` | `/pacientes` | Cadastra um paciente | `201` | `400` se faltar nome, email ou nascimento ou o telefone for inválido · `409` se o e-mail já estiver cadastrado |
| `PUT` | `/pacientes/:id` | Atualiza um paciente | `200` | `404` se não existir · `400` se os dados forem inválidos · `409` se o e-mail já estiver cadastrado |
| `DELETE` | `/pacientes/:id` | Exclui um paciente | `204` (sem corpo) | `400` se o ID for inválido · `404` se não existir |

Exemplo de corpo para `POST` e `PUT`:

```json
{
  "nome": "Paciente Exemplo",
  "email": "exemplo@email.com",
  "nascimento": "2000-01-01",
  "telefone": "(11) 99999-9999"
}
```

O telefone é opcional: aceita texto com até 20 caracteres. Sem valor, ele é salvo como `NULL` e aparece como **Não informado** no site. Ao editar, envie o telefone atual para mantê-lo ou `null` para removê-lo. O `PUT` substitui os dados cadastrais enviados.

As respostas de cadastro, edição e consulta também incluem `id` e `criado_em`. A data de cadastro é gerada pelo banco e não é alterada na edição. Na tabela do site, ela aparece na coluna **Cadastrado em**, no horário do navegador. O nascimento continua como texto `AAAA-MM-DD`.

**O que cada código de status significa:**

- `200 OK`: deu certo e a resposta traz dados.
- `201 Created`: um paciente novo foi criado.
- `204 No Content`: deu certo, mas não há nada para devolver (usado na exclusão).
- `400 Bad Request`: a requisição veio com dados faltando.
- `404 Not Found`: o paciente (ou a rota) não existe.
- `409 Conflict`: já existe um paciente com o mesmo e-mail.

## Como rodar no seu computador

Pré-requisito: ter o [Node.js](https://nodejs.org) instalado (versão 22 ou mais nova). O banco continua no Supabase; não é necessário instalar PostgreSQL local.

**1. Configure e inicie o backend**

```bash
cd atividade07-CRUD/backend
npm install
cp -n .env.example .env
```

Preencha `.env` com `DATABASE_URL` do Session pooler do seu Supabase (incluindo a senha) e `DB_SSL=true`. Não substitua um `.env` já configurado. O arquivo é ignorado pelo Git.

```bash
npm run db:setup    # cria a tabela base e insere os três pacientes iniciais
npm run db:migrate  # adiciona telefone e criado_em com ALTER TABLE
npm run dev         # inicia a API em http://localhost:3000 com recarga automática
```

**2. Abra o site**

Abra o arquivo `frontend/index.html` no navegador (ou use a extensão Live Server do VS Code).

O frontend seleciona a API automaticamente: em `localhost`, `127.0.0.1`, IPv6 local ou arquivo aberto diretamente, usa `http://localhost:3000/pacientes`; no site publicado, usa a API do Render. Ambas usam o banco configurado no backend correspondente.

## Persistência e migrações da Aula 09

Os pacientes ficam no PostgreSQL do Supabase e continuam disponíveis após reiniciar a API. Não existe mais array de pacientes no servidor.

O `schema.sql` mantém a estrutura original da aula. As novas colunas são adicionadas apenas pelos scripts `ALTER TABLE`:

- `adicionar-telefone.sql`: adiciona `telefone VARCHAR(20)`, opcional para preservar os registros existentes.
- `adicionar-criado-em.sql`: adiciona `criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()`. O fuso acompanha o instante do cadastro; nos registros anteriores à migração, o valor indica o momento em que ela foi aplicada, pois a data histórica não era armazenada.
- `npm run db:migrate`: aplica as duas alterações em uma transação. Os scripts usam `IF NOT EXISTS` e podem ser reaplicados.

`CREATE TABLE IF NOT EXISTS` não altera uma tabela existente. Cada banco independente precisa receber as mesmas migrações. Quando a API local e a do Render usam a mesma `DATABASE_URL`, a alteração no Supabase atende às duas.

O banco impede e-mails idênticos pela restrição `UNIQUE` da coluna `email`. O PostgreSQL devolve o código `23505`, que a API traduz para `409 Conflict`. A restrição atual é sensível a maiúsculas e minúsculas. A busca por nome usa `ILIKE $1` com `%termo%`, e o total usa `COUNT(*)`, mantendo `/pacientes/total` antes da rota por ID.

### Reset dos dados de teste

O comando abaixo apaga a tabela `pacientes` do banco apontado pelo `.env`, recria os três pacientes iniciais e reaplica as migrações. Use somente quando quiser descartar os cadastros desse banco:

```bash
npm run db:reset -- --confirmar
```

Sem `--confirmar`, o script recusa a execução antes de conectar ao banco. O reset usa uma transação para evitar uma tabela parcialmente recriada se ocorrer erro. Ele não é necessário para instalar as novas colunas.

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
- Configure `DATABASE_URL` e `DB_SSL=true` no serviço da API. Aplique `db:migrate` nesse banco antes de publicar o backend que consulta as novas colunas; a configuração de produção não vem do `.env` local.


## Como o projeto foi feito (com ajuda do Claude)

Este projeto foi desenvolvido com o apoio do **Claude** (assistente de IA da Anthropic), usado pelo **Claude Code** no terminal e no VS Code. Ele ajudou em três frentes:

### 1. Planejamento com issues

A partir das orientações de entrega do professor e do documento de requisitos da aula (PRD), o Claude ajudou a quebrar o trabalho em **10 issues** pequenas, cada uma com descrição e critérios de aceite. Depois, essas issues foram cadastradas no GitHub.

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
| I10 | Validar a entrega e documentar (este README) | #18 |
| Extra | Impedir cadastro de e-mail duplicado (`409`) | #19 |
| Extra | Filtrar pacientes por nome na listagem | #20 |

As duas últimas são exercícios extras do PRD, feitos depois da entrega principal.

### 2. Commits organizados

Cada issue virou **um commit**, seguindo o padrão *Conventional Commits* (`tipo(área): descrição #issue`). Assim o histórico conta a história do projeto passo a passo:

```
0b5d264 feat(backend): filtrar pacientes por nome na listagem #20
f0271a9 feat(backend): impedir cadastro de e-mail duplicado com status 409 #19
3a3331a docs: documentar execução, testes e deploy da atividade 07
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

### Validação da Aula 09 com Supabase

As alterações de telefone e data de cadastro foram testadas na API local conectada ao Supabase e na interface pelo Chrome, com larguras de 1440 px e 390 px. Esta validação ainda não confirma o deploy dessas alterações no Render.

| Cenário | Resultado |
|---|---|
| Reaplicar `db:migrate` | Colunas existentes preservadas, sem erro |
| Cadastrar com telefone ou sem telefone | `201`; telefone salvo como texto ou `NULL` |
| Enviar telefone numérico, objeto, lista ou texto com mais de 20 caracteres | `400`, no cadastro e na edição |
| Cadastrar e-mail idêntico ao existente | `409`, sem novo cadastro |
| Editar e remover telefone | `200`, com persistência confirmada na consulta |
| Enviar uma data de cadastro pelo cliente | Valor ignorado; o banco gera `criado_em` e a edição o preserva |
| Reiniciar a API local | Paciente, telefone e data de cadastro permanecem no Supabase |
| Cadastrar, editar, recarregar e excluir pela interface | Fluxo concluído, inclusive no celular |
| Buscar sem resultados e simular falha de carregamento | Mensagens ocupam as seis colunas da tabela |
| Executar reset sem `--confirmar` | Bloqueado, sem alteração nos dados |

Os registros temporários foram removidos ao final. O reset com confirmação não foi executado no banco compartilhado do Supabase.

### Histórico anterior à persistência

Os registros abaixo documentam os testes da versão anterior, com dados em memória, realizados em 29/10/2026. Eles não representam a validação em produção das alterações da Aula 09. Os testes usaram um paciente fictício, que foi criado, editado e excluído em seguida.

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

### Testes dos exercícios extras

Depois da entrega principal, foram feitos dois exercícios extras do PRD: o filtro por nome e o bloqueio de e-mail repetido.

| # | Teste | Esperado | Local | Produção |
|---|---|---|---|---|
| 12 | `GET /pacientes?nome=ana` | `200` só com "Ana Costa" | ✅ 200, 1 paciente | ✅ 200, 1 paciente |
| 13 | `GET /pacientes?nome=SILVA` (maiúsculas) | `200` só com "Maria Silva" | ✅ 200, 1 paciente | ✅ 200, 1 paciente |
| 14 | `GET /pacientes?nome=xyz` (ninguém bate) | `200` com lista vazia `[]` | ✅ 200, `[]` | ✅ 200, `[]` |
| 15 | `GET /pacientes` sem filtro | `200` com todos | ✅ 200, 4 pacientes | ✅ 200, 4 pacientes |
| 16 | `POST` com e-mail já cadastrado (`maria.silva@email.com`) | `409` | ✅ 409 | ✅ 409 |
| 17 | `POST` com o mesmo e-mail em maiúsculas | `409` | ✅ 409 | ✅ 409 |
| 18 | `POST` com e-mail novo | `201` | ✅ 201 | ✅ 201 |

**Por que `/pacientes/total` fica antes de `/pacientes/:id`?** O Express testa as rotas na ordem em que foram escritas. Se `/pacientes/:id` viesse primeiro, uma requisição para `/pacientes/total` cairia nela, com `id = "total"`. Como `Number("total")` vira `NaN`, nenhum paciente seria encontrado e a resposta seria `404`, em vez de `{ "total": N }`.

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

# Filtrar por nome
curl "$BASE?nome=ana"

# Erro 409: e-mail já cadastrado
curl -i -X POST $BASE -H "Content-Type: application/json" \
  -d '{"nome":"Outra Maria","email":"maria.silva@email.com","nascimento":"2000-01-01"}'
```

## Tecnologias usadas

- **Node.js** + **Express 5**: servidor e rotas da API.
- **cors**: deixa o site (em outro endereço) acessar a API.
- **pg** + **PostgreSQL/Supabase**: conexão, consultas parametrizadas e persistência dos pacientes.
- **HTML, CSS, JavaScript** + **Bootstrap 5**: interface do site.
- **Fetch API**: comunicação do site com a API.
- **Render**: hospedagem gratuita do backend e do frontend.
- **Claude Code** + **plugin do Render**: planejamento, commits e deploy.
