# Lógica de Negócio

## Usuários

O usuário é a entidade central do sistema. Todo dado (contas, transações, chave Pierre) pertence a um usuário.

**Registro:** ao se registrar, a senha é hasheada com bcrypt (salt rounds: 10) antes de ser persistida. Emails duplicados são rejeitados com erro 409.

**Login:** a senha informada é comparada ao hash armazenado via `bcrypt.compare`. Em caso de sucesso, um token JWT é gerado com expiração de 7 dias. Credenciais inválidas retornam sempre o mesmo erro genérico (`"Invalid credentials"`) — sem indicar se o e-mail ou a senha estão errados.

**CRUD:** operações de leitura e escrita retornam um `SafeUser`, que omite os campos `password` e `pierre_api_key` da resposta. Esses campos nunca são expostos pela API.

---

## Chave Pierre (API Key)

Para que o sistema consiga buscar dados bancários, o usuário precisa vincular sua chave pessoal da Pierre Finance.

**Salvar chave:** a chave é criptografada com AES-256-GCM antes de ser gravada no campo `pierre_api_key` do usuário. Consulte a [documentação técnica](./technical.md) para detalhes da criptografia.

**Remover chave:** o campo `pierre_api_key` é setado para `null`. Sem a chave, qualquer tentativa de sincronização retorna erro 404.

---

## Contas

Contas bancárias são sincronizadas a partir da Pierre Finance e armazenadas localmente. O sistema também permite operações manuais de CRUD para casos de uso específicos.

**Sincronização (`POST /api/accounts/sync/:userId`):**
1. Busca o usuário e descriptografa a `pierre_api_key`
2. Chama a Pierre Finance API
3. Valida a resposta com o schema Zod da Pierre
4. Para cada conta retornada, executa um `upsert` usando `external_id` como chave:
   - **Cria** se a conta ainda não existe localmente
   - **Atualiza** saldo, limite disponível, data de vencimento e pagamento mínimo se já existir
5. Registra o horário da sincronização em `synced_at`

O `external_id` é o identificador da conta na Pierre API e garante que a mesma conta não seja duplicada em sincronizações subsequentes.

**Campos de crédito** (`credit_limit`, `available_credit_limit`, `balance_due_date`, `minimum_payment`) são opcionais e só são preenchidos para contas do tipo cartão de crédito.

---

## Transações

Transações são movimentações financeiras vinculadas a uma conta. Atualmente o CRUD é operado manualmente — a sincronização automática de transações via Pierre API ainda está em desenvolvimento.

Cada transação possui:
- Vínculo obrigatório com uma conta (`accountId`)
- Um `external_id` único, que evita duplicatas quando a sincronização automática for implementada
- Campos de parcelamento opcionais (`installment_number`, `installment_total`)
- Uma `category` (obrigatória) e `original_category` (opcional, preserva a categoria original da Pierre)

Endpoints disponíveis: `GET`, `GET /:id`, `POST`, `PUT /:id`, `DELETE /:id` em `/api/transactions`.
