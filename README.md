# Bolão Solidário HM + Semeando Amor

MVP fullstack para o Bolão Solidário da Copa 2026, promovido pela HM Bazar e Conveniência em apoio à Associação Semeando Amor com a Tia Mônica.

## Stack

- React + Vite
- Express
- PostgreSQL
- Docker Compose
- Railway-ready via `railway.toml`

## Rodar Local

```bash
corepack pnpm install
corepack pnpm check
corepack pnpm build
docker compose up -d
```

Serviços locais:

```text
App/API:  http://localhost:3000
Adminer:  http://localhost:8081
Postgres: localhost:5433
```

Se preferir rodar API fora do Docker:

```bash
cp .env.example .env
corepack pnpm api
```

## Variáveis de Ambiente

```env
DATABASE_URL=postgres://bolao:bolao_dev@localhost:5433/bolao_hm
ADMIN_PASSWORD=troque_esta_senha
PORT=4000
HOST=0.0.0.0
```

Em produção, `DATABASE_URL` é obrigatório. `ADMIN_PASSWORD` libera o painel `/admin`.

## Banco de Dados

O servidor aplica automaticamente os SQLs de `db/init` ao iniciar:

```text
db/init/001_schema.sql
db/init/002_seed_matches.sql
db/init/003_admin_confirmation.sql
```

O seed inicial inclui os 72 jogos da primeira fase. Os inserts usam `ON CONFLICT`, então reiniciar a aplicação não duplica jogos.

Pontuação oficial:

- Placar exato: 10 pontos
- Acertou vencedor ou empate: 5 pontos
- Errou: 0 pontos

## Endpoints Principais

Públicos:

```bash
curl http://localhost:3000/api/health
curl http://localhost:3000/api/matches
curl http://localhost:3000/api/ranking
```

Participante:

```bash
curl -X POST http://localhost:3000/api/participants \
  -H 'Content-Type: application/json' \
  -d '{
    "code":"BOLAO-2026-0001",
    "fullName":"Maria Silva",
    "whatsapp":"11999999999",
    "donationType":"Alimentos não perecíveis",
    "deliveryPoint":"HM Bazar",
    "voucherCode":"ALIMENTO10",
    "voucherDiscount":"10% de desconto"
  }'
```

```bash
curl 'http://localhost:3000/api/participants/access?code=BOLAO-2026-0001&whatsapp=11999999999'
```

Admin:

```bash
curl -X POST http://localhost:3000/api/admin/login \
  -H 'Content-Type: application/json' \
  -d '{"password":"troque_esta_senha"}'
```

```bash
curl http://localhost:3000/api/admin/participants \
  -H 'x-admin-password: troque_esta_senha'
```

```bash
curl -X POST http://localhost:3000/api/admin/results \
  -H 'Content-Type: application/json' \
  -H 'x-admin-password: troque_esta_senha' \
  -d '{"matchId":1,"homeScore":2,"awayScore":1}'
```

## Deploy no Railway

1. Crie um projeto no Railway a partir deste repositório.
2. Adicione um serviço PostgreSQL.
3. Configure as variáveis no serviço web:

```env
DATABASE_URL=${{Postgres.DATABASE_URL}}
ADMIN_PASSWORD=uma_senha_forte
NODE_ENV=production
```

4. Railway usa o `Dockerfile` via `railway.toml`.
5. Healthcheck configurado em `/api/health`.

## Fluxo do MVP

1. Participante faz cadastro e escolhe a doação.
2. Site gera código de participação.
3. Participante salva palpites dos jogos.
4. Admin entra em `/admin` com `ADMIN_PASSWORD`.
5. Admin confirma doações.
6. Admin lança resultados.
7. Ranking público exibe participantes confirmados e pontuação.
