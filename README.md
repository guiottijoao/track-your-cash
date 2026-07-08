# Track Your Cash

API REST para monitoramento de transações e movimentações bancárias. O sistema integra-se à [Pierre Finance](https://www.pierre.finance) como fonte de dados bancários, persistindo contas e transações em base própria.

> Projeto em desenvolvimento ativo.

---

## Documentação

### Introdução
Visão geral do projeto, objetivo, o que faz e como funciona.
→ [docs/overview.md](./docs/overview.md)

### Parte Técnica
Stack, arquitetura, estrutura de pastas, modelos do banco de dados, integração com a Pierre Finance API e criptografia.
→ [docs/technical.md](./docs/technical.md)

### Lógica de Negócio
Como funcionam as operações de usuários, chave Pierre, contas (incluindo sincronização) e transações.
→ [docs/business-logic.md](./docs/business-logic.md)

### Autenticação
Política de permissão, fluxo de registro e login, token JWT e middleware de autenticação.
→ [docs/auth.md](./docs/auth.md)

---

## Início rápido

**Instalar dependências**
```bash
npm install
```

**Configurar variáveis de ambiente**

Crie um arquivo `.env` na raiz do projeto com:
```env
DATABASE_URL="file:./prisma/choosekindness.db"
JWT_SECRET="therearealreadymanybadpeople_jwt"
ENCRYPTION_KEY="dontforgetitsallforfun"
```

**Aplicar as migrações do banco**
```bash
npx prisma migrate dev
```

**Iniciar o servidor**
```bash
npm start
```

O servidor sobe na porta `3000` por padrão. A documentação interativa da API estará disponível em `http://localhost:3000/api-docs`.
