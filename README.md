# HaxisSystem

Sistema de gestao de projetos, estoque e midia para operacoes de serralheria, automacao e engenharia mecanica.

O estado atual do projeto e um backend em `Express + TypeScript`, com persistencia em memoria, arquivos estaticos servidos pelo proprio backend e upload local em disco para anexos de projeto.

## Visao Geral

O sistema hoje e composto por 5 dominios principais:

- `Usuarios/Auth`: cadastro de usuario, login por email ou nome e emissao de JWT.
- `Projetos`: CRUD de projetos, filtros e atualizacao de status.
- `Estoque`: CRUD de itens, movimentacoes de entrada/saida e consulta de historico.
- `Midia`: upload e exclusao de imagens/videos vinculados a projetos.
- `Dashboard`: agregacoes de projetos e estoque para o frontend.

Tambem existe um frontend estatico simples em `public/`:

- `public/index.html`: painel principal da aplicacao.
- `public/test-panel.html`: painel rapido de testes manuais.

## Topologia

### Backend

- `src/server.ts`
  - Inicializa `dotenv`, `express`, `cors` e `express.json()`.
  - Serve `public/` como arquivos estaticos.
  - Serve `uploads/` em `/uploads`.
  - Monta todas as rotas da API sob o prefixo `/api`.

- `src/routes/`
  - Camada de roteamento HTTP por dominio.

- `src/controllers/`
  - Implementa as regras de negocio e armazenamento em memoria.

- `src/models/`
  - Define enums e interfaces de dados.

- `src/middleware/auth.ts`
  - Middleware JWT e middleware opcional por role.

### Frontend estatico

- `public/index.html`
  - Login
  - Dashboard
  - CRUD de projetos
  - CRUD de estoque
  - Upload e listagem de midias

- `public/test-panel.html`
  - Tela reduzida para testes de projeto e estoque

### Arquivos e armazenamento

- `uploads/`
  - Armazena imagens e videos enviados pelos endpoints de midia.
  - Arquivos sao apagados do disco quando a midia e excluida pela API.

- Memoria do processo
  - Usuarios
  - Projetos
  - Itens de estoque
  - Movimentacoes
  - Midias cadastradas

Se o processo reiniciar, esses dados em memoria sao perdidos.

## Estrutura de Pastas

```text
.
├── public/
│   ├── index.html
│   └── test-panel.html
├── src/
│   ├── controllers/
│   │   ├── dashboardController.ts
│   │   ├── inventoryController.ts
│   │   ├── mediaController.ts
│   │   ├── projectController.ts
│   │   └── userController.ts
│   ├── middleware/
│   │   └── auth.ts
│   ├── models/
│   │   ├── InventoryItem.ts
│   │   ├── Project.ts
│   │   ├── ProjectMedia.ts
│   │   └── User.ts
│   ├── routes/
│   │   ├── dashboardRoutes.ts
│   │   ├── inventoryRoutes.ts
│   │   ├── mediaRoutes.ts
│   │   ├── projectRoutes.ts
│   │   └── userRoutes.ts
│   └── server.ts
├── uploads/
├── api-tests.http
├── nodemon.json
├── package.json
└── tsconfig.json
```

## Modulos

### 1. Usuarios e Autenticacao

Arquivos:

- `src/routes/userRoutes.ts`
- `src/controllers/userController.ts`
- `src/models/User.ts`
- `src/middleware/auth.ts`

Responsabilidades:

- Criar usuarios com senha criptografada via `bcryptjs`
- Login por email ou nome
- Gerar JWT com expiracao de 1 hora
- Expor middleware para proteger rotas

Estado atual:

- Existe um usuario admin fixo criado em memoria na subida da aplicacao:
  - `id: admin-01`
  - `email: teste@email.com`
  - `senha: 123456`
- `role: GESTOR`
- As rotas de projetos, estoque, midia e dashboard exigem JWT.

Roles definidas no modelo:

- `PROGRAMADOR`
- `ENGENHEIRO_MECANICO`
- `ENGENHEIRO_ELETRICO`
- `GESTOR`
- `DESENVOLVEDOR`

Validacao:

- O cadastro de usuario agora rejeita roles fora do enum `UserRole`.

### 2. Projetos

Arquivos:

- `src/routes/projectRoutes.ts`
- `src/controllers/projectController.ts`
- `src/models/Project.ts`

Responsabilidades:

- Criar, listar, detalhar, editar e excluir projetos
- Filtrar por `sector`, `status` e `responsibleId`
- Atualizar status por endpoint dedicado
- Fornecer os dados agregados consumidos pelo dashboard

Setores:

- `SERRALHERIA`
- `AUTOMACAO`
- `ENGENHARIA_MECANICA`

Status:

- `PLANEJAMENTO`
- `EM_ANDAMENTO`
- `AGUARDANDO_MATERIAL`
- `EM_REVISAO`
- `CONCLUIDO`
- `CANCELADO`

### 3. Estoque

Arquivos:

- `src/routes/inventoryRoutes.ts`
- `src/controllers/inventoryController.ts`
- `src/models/InventoryItem.ts`

Responsabilidades:

- Criar itens de estoque com numero sequencial interno
- Listar todos os itens ou filtrar por categoria
- Atualizar e excluir itens
- Registrar movimentacoes de entrada e saida
- Impedir saida com saldo insuficiente
- Expor historico por item e historico global

Categorias de estoque:

- `SERRALHERIA`
- `MECANICA`
- `ELETRICA`
- `PNEUMATICA`
- `OUTROS`

Unidades:

- `UNIDADE`
- `METRO`
- `KG`
- `LITRO`
- `CAIXA`
- `PAR`
- `ROLO`

Modelo do item:

- `numero`
- `description`
- `fabricante`
- `codigo`
- `quantity`
- `unit`
- `category`
- `createdAt`
- `updatedAt`

Modelo da movimentacao:

- `id`
- `itemNumero`
- `type`
- `quantity`
- `reason`
- `date`
- `userId`

### 4. Midia

Arquivos:

- `src/routes/mediaRoutes.ts`
- `src/controllers/mediaController.ts`
- `src/models/ProjectMedia.ts`

Responsabilidades:

- Upload de imagem ou video vinculado a projeto
- Listagem de midias por projeto
- Listagem global de midias
- Busca por ID
- Exclusao do registro e do arquivo fisico

Formatos aceitos:

- Imagens: `jpeg`, `png`, `webp`, `gif`
- Videos: `mp4`, `webm`

Limites:

- Tamanho maximo por arquivo: `100 MB`

Fluxo de armazenamento:

- O `multer` grava o arquivo em `uploads/`
- O caminho salvo no registro e `fileKey`
- O arquivo pode ser acessado via `/uploads/<arquivo>`

### 5. Dashboard

Arquivos:

- `src/routes/dashboardRoutes.ts`
- `src/controllers/dashboardController.ts`

Responsabilidades:

- Consolidar metricas de projetos
- Consolidar metricas de estoque
- Expor uma visao geral para o painel principal

Metricas atuais de projetos:

- Total
- Por status
- Por setor
- Quantidade de atrasados
- Lista de projetos atrasados
- Projetos iniciados no mes

Metricas atuais de estoque:

- Total de itens
- Quantidade por categoria

## Rotas da API

Todas as rotas abaixo sao montadas sob o prefixo `/api`.

Rotas protegidas por JWT:

- todos os endpoints de `Projetos`
- todos os endpoints de `Estoque`
- todos os endpoints de `Midia`
- todos os endpoints de `Dashboard`

### Usuarios/Auth

| Metodo | Rota | Descricao |
|---|---|---|
| POST | `/api/users` | Cria usuario |
| POST | `/api/login` | Faz login por email ou nome |

### Projetos

| Metodo | Rota | Descricao |
|---|---|---|
| POST | `/api/projects` | Cria projeto |
| GET | `/api/projects` | Lista projetos com filtros opcionais |
| GET | `/api/projects/:id` | Busca projeto por ID |
| PUT | `/api/projects/:id` | Atualiza projeto |
| DELETE | `/api/projects/:id` | Exclui projeto |
| GET | `/api/projects/sector/:sector` | Lista projetos por setor |
| PATCH | `/api/projects/:id/status` | Atualiza apenas o status |

Filtros suportados em `GET /api/projects`:

- `sector`
- `status`
- `responsibleId`

### Estoque

| Metodo | Rota | Descricao |
|---|---|---|
| POST | `/api/inventory` | Cria item de estoque |
| GET | `/api/inventory` | Lista itens com filtro opcional por categoria |
| GET | `/api/inventory/movements` | Lista todas as movimentacoes |
| GET | `/api/inventory/:numero` | Busca item por numero |
| PUT | `/api/inventory/:numero` | Atualiza item |
| DELETE | `/api/inventory/:numero` | Exclui item |
| POST | `/api/inventory/:numero/move` | Registra entrada ou saida |
| GET | `/api/inventory/:numero/movements` | Lista historico de um item |

Filtro suportado em `GET /api/inventory`:

- `category`

### Midia

| Metodo | Rota | Descricao |
|---|---|---|
| POST | `/api/projects/:projectId/media` | Upload de midia para um projeto |
| GET | `/api/projects/:projectId/media` | Lista midias de um projeto |
| GET | `/api/media` | Lista todas as midias |
| GET | `/api/media/:id` | Busca midia por ID |
| DELETE | `/api/media/:id` | Exclui midia e arquivo fisico |

### Dashboard

| Metodo | Rota | Descricao |
|---|---|---|
| GET | `/api/dashboard` | Visao geral de projetos e estoque |
| GET | `/api/dashboard/projects` | Resumo de projetos |
| GET | `/api/dashboard/inventory` | Resumo de estoque |

## Fluxos Principais

### Login

1. O cliente envia `POST /api/login` com `email` e `password`.
2. O backend aceita o campo `email` como identificador de login e compara com `email` ou `name`.
3. Se a senha bater, retorna `token` JWT e dados basicos do usuario.

### Cadastro de projeto

1. O cliente envia `title`, `sector` e `startDate` obrigatoriamente.
2. O backend gera `id`, `createdAt` e `updatedAt`.
3. O projeto fica disponivel nas rotas de listagem, detalhe e dashboard.

### Cadastro e movimentacao de estoque

1. O item recebe `numero` sequencial automatico.
2. Cada entrada ou saida gera uma `InventoryMovement`.
3. Saidas acima do saldo atual sao rejeitadas.

### Upload de midia

1. O cliente envia `multipart/form-data` para `/api/projects/:projectId/media`.
2. O `multer` grava o arquivo em `uploads/`.
3. O backend registra a midia em memoria e a associa ao projeto.
4. Na exclusao, o registro sai da memoria e o arquivo e removido do disco.

## Frontend Atual

### `public/index.html`

Contem um painel completo com:

- tela de login
- dashboard inicial
- listagem, criacao, edicao e exclusao de projetos
- detalhe de projeto com midias
- listagem, criacao, edicao e exclusao de itens de estoque
- movimentacao de estoque
- listagem global de midias

### `public/test-panel.html`

Contem um painel simples para testes rapidos de:

- login com JWT
- criacao de projetos
- criacao de itens de estoque
- listagem basica de projetos
- listagem basica de estoque

## Scripts

| Script | Funcao |
|---|---|
| `npm run build` | Compila TypeScript para `dist/` |
| `npm run start` | Executa a build compilada |
| `npm run dev` | Executa servidor com `nodemon` e `ts-node` |
| `npm run dev:all` | Sobe backend e o projeto `../HaxisSystem-UI` em paralelo |

## Como Rodar

```bash
npm install
npm run build
npm run dev
```

Servidor padrao:

- `http://localhost:3000`

## Credenciais Padrao

| Campo | Valor |
|---|---|
| Email | `teste@email.com` |
| Senha | `123456` |
| Usuario | `André Schenkel` |
| ID | `admin-01` |

## Arquivos de Apoio

- [api-tests.http](/C:/Users/Haxis/WebstormProjects/HaxisSystem/api-tests.http)
  - Colecao manual de chamadas HTTP para testar a API.

- [nodemon.json](/C:/Users/Haxis/WebstormProjects/HaxisSystem/nodemon.json)
  - Configura `nodemon` com `ts-node --transpile-only`.

## Limitacoes Atuais

- Persistencia totalmente em memoria
- Sem banco de dados
- Sem validacao forte de payload com schema
- Sem controle de permissao real por role nas rotas
- Sem testes automatizados
- Frontend acoplado em HTML estatico
- Dashboard ainda simples no lado de estoque

## Regra de Documentacao

Sempre que a topologia do sistema mudar, este README deve ser atualizado junto com:

- novos modulos
- novas rotas
- alteracoes de modelos
- mudancas de fluxo
- novos arquivos publicos
- alteracoes de persistencia ou integracao externa
