# Autenticação

## Visão geral

O Track Your Cash usa autenticação stateless baseada em **JWT (JSON Web Token)**. Não há sessões no servidor — a identidade do usuário é verificada a cada requisição pelo token enviado no header.

---

## Registro e Login

Ambos os endpoints são **públicos** (não exigem token).

### Registro — `POST /api/auth/register`

```json
{ "name": "João", "email": "joao@email.com", "password": "senha123" }
```

- Verifica se o e-mail já está cadastrado (409 se existir)
- Grava a senha como hash bcrypt com salt de 10 rounds
- Retorna um token JWT assinado

### Login — `POST /api/auth/login`

```json
{ "email": "joao@email.com", "password": "senha123" }
```

- Busca o usuário pelo e-mail
- Compara a senha com `bcrypt.compare`
- Retorna um token JWT assinado em caso de sucesso
- Retorna `401 "Invalid credentials"` para e-mail ou senha inválidos (sem distinguir qual dos dois)

---

## Token JWT

- **Algoritmo:** HS256 (padrão do jsonwebtoken)
- **Payload:** `{ id: number }` — contém apenas o ID do usuário
- **Expiração:** 7 dias
- **Segredo:** variável de ambiente `JWT_SECRET`

---

## Middleware de autenticação

O middleware `authenticate` (`src/app/middleware/auth.ts`) é aplicado a todos os grupos de rotas exceto `/auth`.

**Fluxo de validação:**

1. Lê o header `Authorization`
2. Verifica se começa com `Bearer ` — retorna `401` caso contrário
3. Extrai e verifica o token com `jwt.verify` usando o `JWT_SECRET`
4. Busca o usuário no banco pelo `id` contido no payload
5. Injeta o objeto `user` em `req.user` e chama `next()`

Qualquer falha nesse fluxo (token ausente, expirado, inválido ou usuário não encontrado) retorna `401`.

---

## Rotas públicas e protegidas

| Rota | Método | Autenticação |
|---|---|---|
| `/api/auth/register` | POST | Pública |
| `/api/auth/login` | POST | Pública |
| `/api/users/**` | Todos | Requer token |
| `/api/accounts/**` | Todos | Requer token |
| `/api/transactions/**` | Todos | Requer token |

---

## Como usar o token

Inclua o token JWT no header de todas as requisições protegidas:

```
Authorization: Bearer <seu_token>
```

---