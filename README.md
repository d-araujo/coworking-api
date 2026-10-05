# Coworking API

## Sobre o projeto
API de um sistema de gestão de salas de coworking, desenvolvida como projeto pessoal. Conta com cadastro e autenticação de usuários (JWT com access e refresh token), controle de acesso por role (ADMIN e usuário comum), gestão de salas e reservas com regras de negócio, como bloqueio de horários conflitantes.

## Deploy
Swagger da API rodando no ar e testável: https://coworking-api-seti.onrender.com/api

## Stack
- NestJS
- TypeScript
- Prisma
- PostgreSQL (Neon)
- Render

## Como rodar localmente

### Pré-requisitos
- Node.js
- Um banco PostgreSQL (local ou em um container Docker)

### Passo a passo
Clone o repositório e instale as dependências:
```bash
git clone <url-do-repositorio>
cd <pasta-do-projeto>
npm install
```

Crie um arquivo `.env` na raiz do projeto com as variáveis:
```env
DATABASE_URL=   # URL de conexão do seu banco PostgreSQL
JWT_SECRET=     # chave secreta aleatória usada para assinar os tokens
CORS_ORIGIN=    # endereço onde o seu frontend vai rodar
```

Rode as migrations para criar as tabelas no banco:
```bash
npx prisma migrate dev
```

Gere o Prisma Client, o código que a API usa para acessar o banco:
```bash
npx prisma generate
```

Suba a API em modo de desenvolvimento:
```bash
npm run start:dev
```

A API sobe em `http://localhost:3000` e o Swagger fica em `http://localhost:3000/api`.

Para rodar a versão de produção:
```bash
npm run build
npm run start:prod
```

## Banco de dados

### User
Armazena os usuários cadastrados no sistema.
- `id` (primary key)
- `name`
- `email` (unique)
- `password`: salva em forma de hash, para proteger os dados em caso de vazamento do banco.
- `role`: cargo do usuário. Algumas rotas são acessíveis apenas aos administradores do sistema, possivelmente os donos dos espaços de coworking.
- `resetPasswordToken` e `resetPasswordExpires`: usados na redefinição de senha.
- `createdAt` e `updatedAt`

### Room
Armazena as salas cadastradas no sistema.
- `id` (primary key)
- `name`
- `description`: detalhes da sala.
- `capacity`
- `isActive`: indica se a sala está ativa.
- `createdAt` e `updatedAt`

### Reservation
Armazena as reservas feitas no sistema. Cada reserva liga um usuário a uma sala, o que cria a relação many-to-many entre usuários e salas.
- `id` (primary key)
- `startTime`: início da reserva.
- `endTime`: fim da reserva.
- `userId`: usuário que fez a reserva.
- `roomId`: sala reservada.
- `createdAt` e `updatedAt`

### RefreshToken
Armazena os refresh tokens emitidos pelo sistema.
- `id` (primary key)
- `token`
- `userId`: usuário dono do token.
- `expiresAt`
- `createdAt`

## Módulos

### Auth
Rotas de registro, login, esquecimento de senha e validação de usuário, com autenticação JWT.

**Por que um access token stateless?** O access token expira em apenas 15 minutos e, por ser stateless, não pode ser revogado depois de gerado. Considerei esse risco aceitável: em caso de invasão, revogar todos os refresh tokens (os tokens de longa duração) já corta o acesso, e uma janela de 15 minutos não conseguiria causar grande impacto na conta de um usuário.

### Users
Busca, atualização e remoção de usuários (o cadastro é feito pela rota de registro do módulo Auth). Usuários comuns só conseguem consultar e alterar os próprios dados. A remoção de um usuário é restrita a ADMIN, que não pode deletar a própria conta.

### Rooms
CRUD de salas: criação, busca, atualização, ativação/desativação e remoção. Criar, alterar e remover salas é restrito a ADMIN. Na listagem, o ADMIN vê todas as salas, enquanto usuários comuns veem apenas as ativas.

### Reservation
Um dos principais módulos da aplicação, responsável pelas regras de negócio das reservas.

**Criação:** antes de criar uma reserva, a API faz duas verificações:
- **Horário válido:** o `startTime` precisa ser anterior ao `endTime`.
- **Conflito de horário:** a API busca, na mesma sala, alguma reserva que termine depois do início da nova reserva e comece antes do término dela. Se existir, os horários se sobrepõem e a criação é bloqueada.

**Cancelamento:**
- O usuário comum só pode cancelar as próprias reservas, e com pelo menos 24h de antecedência do início.
- O ADMIN pode cancelar qualquer reserva, a qualquer momento.

## Próximos passos
- Frontend em HTML, CSS e JavaScript consumindo a API.
- Testes reescritos e ampliados.
