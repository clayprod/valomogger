# Valomogger

Ranking e cinturao de MVPs do VALORANT por ACS, regiao e rank.

## Como funciona

- Apenas partidas `competitive` contam no v1.
- Todos os jogadores ingeridos na base aparecem nos rankings.
- O Mogger segura o cinturao ate perder uma partida.
- Quando o Mogger perde, o MVP do time vencedor vira o novo Mogger.
- Existem cinturoes por regiao/rank e um Mogger geral por regiao.
- Ranking por agente usa ACS puro como pontuacao no v1.

## Setup local

```bash
npm install
cp .env.example .env
docker compose up -d db
npm run prisma:deploy
npm run dev
```

Abra `http://localhost:3000`.

## Ingestao

Configure `RIOT_API_KEY` no `.env` e rode:

```bash
npm run ingest:recent -- 20
```

Tambem existe a rota:

```http
POST /api/admin/ingest/recent
Content-Type: application/json

{ "limit": 20 }
```

## Deploy

O workflow `.github/workflows/ci-cd.yml` roda lint, typecheck, testes, build e publica a imagem em:

```text
ghcr.io/<owner>/<repo>:latest
ghcr.io/<owner>/<repo>:<git-sha>
```

No EasyPanel:

- crie um app Docker apontando para a imagem `latest`;
- crie um Postgres pelo EasyPanel;
- injete `DATABASE_URL`, `RIOT_API_KEY`, `RIOT_REGION`, `DEFAULT_LOCALE` e `NEXT_TELEMETRY_DISABLED`;
- exponha a porta `3000`.

O container roda `prisma migrate deploy` antes de iniciar o servidor Next.js.
