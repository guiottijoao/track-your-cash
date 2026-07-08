# Documentação Técnica

## Stack

| Camada | Tecnologia |
|---|---|
| Runtime | Node.js + TypeScript |
| Framework HTTP | Express 5 |
| ORM | Prisma 6 |
| Banco de dados | PostgreSQL |
| Validação de esquemas | Zod 4 |
| Autenticação | JSON Web Token (jsonwebtoken) |
| Documentação API | Swagger UI + zod-to-openapi |
| Testes | Vitest + Supertest |
| Dev server | Nodemon + ts-node |

O sistema ainda conta com:
- Hash de senha
- Criptografia para chaves
  

---

## Estrutura de pastas

```
src/
├── app/
│   ├── api/            # Clientes para APIs externas (Pierre Finance)
│   ├── controllers/    # Recebem a requisição, chamam o service, devolvem a resposta
│   ├── middleware/     # Autenticação JWT e tratamento de erros
│   ├── routes/         # Definição de rotas e aplicação de middlewares
│   ├── schemas/        # Schemas Zod (validação + geração OpenAPI)
│   └── services/       # Lógica de negócio e acesso ao banco via Prisma
├── config/             # Configuração da aplicação e do documento OpenAPI
├── lib/                # Instância singleton do Prisma Client
├── tests/              # Testes de integração
├── types/              # Extensões de tipos TypeScript (ex: req.user)
└── utils/              # Utilitários reutilizáveis (criptografia)
prisma/
├── schema.prisma       # Definição dos modelos de dados
└── migrations/         # Histórico de migrações do banco
```

---

## Banco de dados

O banco possui três modelos principais.

### User

Representa o usuário da aplicação. Armazena credenciais de acesso e, opcionalmente, a chave criptografada da Pierre Finance API.

| Campo | Tipo | Descrição |
|---|---|---|
| `id` | Int | Chave primária auto-incremental |
| `name` | String | Nome do usuário |
| `email` | String (único) | E-mail de acesso |
| `password` | String | Senha em hash bcrypt |
| `pierre_api_key` | String? | Chave Pierre, criptografada com AES-256-GCM |
| `created_at` | DateTime | Data de criação |

### Account

Representa uma conta bancária sincronizada da Pierre Finance. Contém campos financeiros básicos e, para contas de crédito, campos adicionais como limite e vencimento.

| Campo | Tipo | Descrição |
|---|---|---|
| `id` | Int | Chave primária local |
| `external_id` | String (único) | ID original da conta na Pierre API |
| `userId` | Int | Referência ao usuário dono da conta |
| `name` | String | Nome da conta |
| `type` / `subtype` | String | Tipo da conta (ex: BANK / CHECKING) |
| `number` | String | Número da conta |
| `currency_code` | String | Moeda (ex: BRL) |
| `balance` | String | Saldo atual |
| `owner` | String? | Titular da conta |
| `connector_name` | String? | Nome do banco/conector |
| `connector_image_url` | String? | URL do logo do banco |
| `credit_limit` | Float? | Limite de crédito (cartão) |
| `available_credit_limit` | Float? | Limite disponível (cartão) |
| `balance_due_date` | String? | Data de vencimento da fatura |
| `minimum_payment` | Float? | Pagamento mínimo da fatura |
| `synced_at` | DateTime | Última sincronização com a Pierre API |

### Transaction

Representa uma transação bancária vinculada a uma conta.

| Campo | Tipo | Descrição |
|---|---|---|
| `id` | Int | Chave primária local |
| `external_id` | String (único) | ID original da transação na Pierre API |
| `accountId` | Int | Referência à conta |
| `description` | String | Descrição da transação |
| `amount` | Float | Valor |
| `currency_code` | String | Moeda |
| `date` | DateTime | Data da transação |
| `type` | String | Tipo (ex: DEBIT, CREDIT) |
| `status` | String | Status (ex: POSTED, PENDING) |
| `category` | String | Categoria da transação |
| `original_category` | String? | Categoria original da Pierre API |
| `installment_number` | Int? | Número da parcela |
| `installment_total` | Int? | Total de parcelas |

---

## Documentação interativa (Swagger)

A API possui documentação interativa gerada automaticamente a partir dos schemas Zod via `@asteasolutions/zod-to-openapi`.

Acesse em: `GET /api-docs`