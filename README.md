# Holanda Ops

Sistema de gestão de pessoal: funcionários, setores, turnos, cargos com permissões,
usuários e histórico de alterações. Funciona como PWA (instalável no celular).

## Tecnologias

Next.js 16 (App Router) · React 19 · TypeScript · tRPC 11 · Drizzle ORM + PostgreSQL (Neon) ·
Auth.js (next-auth v5, sessão JWT de 7 dias) · Tailwind 4 + shadcn (base-ui) · Resend (e-mails).

## Como rodar

Requisitos: Node 24+ e um banco PostgreSQL.

```bash
npm install
cp .env.example .env      # preencha os valores (veja abaixo)
npm run db:migrate        # cria as tabelas (banco novo)
npm run dev               # http://127.0.0.1:2000
```

### Variáveis de ambiente

| Variável              | Para quê                                                                  |
| --------------------- | ------------------------------------------------------------------------- |
| `DATABASE_URL`        | Conexão PostgreSQL (com `sslmode=verify-full` no Neon)                    |
| `AUTH_SECRET`         | Segredo das sessões. Gere com `npx auth secret` (obrigatório em produção) |
| `NEXT_PUBLIC_APP_URL` | Endereço público do sistema, usado nos links dos e-mails                  |
| `RESEND_API_KEY`      | Chave do Resend para enviar e-mails (opcional em desenvolvimento)         |
| `UPLOADTHING_TOKEN`   | Envio das fotos dos funcionários ([UploadThing](https://uploadthing.com)) |
| `EMAIL_FROM`          | Remetente dos e-mails, ex.: `Holanda Ops <no-reply@seu-dominio>`          |

O arquivo `.env` nunca vai para o git. Sem `RESEND_API_KEY`/`EMAIL_FROM` o sistema roda, mas
não envia e-mails (criação de usuário e redefinição de senha avisam que o envio falhou).

## Banco de dados

- **Esquema:** `src/server/db/schema/*`. As migrações ficam em `drizzle/`.
- **Alterou o esquema?** `npm run db:generate` e depois `npm run db:migrate`.
- **Banco novo:** `npm run db:migrate` e, em seguida, crie os cargos e o primeiro administrador
  (marque `users.is_admin = true`; administradores têm todas as permissões).
- **Banco que já existia** (criado antes das migrações): rode `scripts/sql/0007_align_with_baseline.sql`
  e depois `npm run db:baseline` uma única vez, para o Drizzle saber que a migração-base já foi aplicada.
- `scripts/sql/0001` a `0006` são o histórico dos ajustes feitos à mão antes da migração-base.
  Não precisam ser rodados em um banco novo.

Exclusões são lógicas (`deleted_at`). CPF, e-mail e nomes de cargo, setor e turno são únicos
apenas entre os registros não removidos.

## Permissões

Cada cargo tem um conjunto de permissões (`src/lib/permissions.ts`); quem tem `is_admin` passa em
tudo. O servidor confere a permissão em cada chamada (`can(...)` em `src/server/api/trpc.ts`) e
também bloqueia contas inativas ou removidas na hora, mesmo com a sessão ainda válida.
Toda alteração feita por quem tem permissão vai para o histórico (`audit_logs`, guardado por
24 meses). Dados pessoais (CPF, RG, Pix, endereço) e senhas não são gravados no histórico.

## Estrutura

```
src/app/(app)        telas logadas (dashboard, funcionários, setores, turnos, cargos, usuários, histórico, perfil)
src/app/(auth)       login, esqueci a senha, redefinir senha
src/app/(public)     pré-cadastro público de funcionário
src/server/api       routers tRPC (um por área)
src/server/db        esquema e conexão
src/components       componentes compartilhados (cards, diálogos, filtros)
src/validators       esquemas zod usados no cliente e no servidor
scripts              SQLs de manutenção e utilitários
```

## Scripts

| Comando               | O que faz                                         |
| --------------------- | ------------------------------------------------- |
| `npm run dev`         | Servidor de desenvolvimento                       |
| `npm run check`       | ESLint + checagem de tipos                        |
| `npm run build`       | Build de produção                                 |
| `npm run db:generate` | Gera uma migração a partir do esquema             |
| `npm run db:migrate`  | Aplica as migrações                               |
| `npm run db:baseline` | Registra a migração-base em um banco já existente |
| `npm run db:studio`   | Interface do Drizzle para ver os dados            |

## Segurança

- Cabeçalhos de segurança em `next.config.js` (sem enquadramento, `nosniff`, HSTS em produção).
- O pré-cadastro público tem campo-armadilha e tempo mínimo de preenchimento, e não revela se um
  CPF já existe.
- Troque `AUTH_SECRET` e a senha do banco se algum dia forem expostos.
