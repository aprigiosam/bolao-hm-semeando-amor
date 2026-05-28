# Estrutura do Projeto

Diretorio principal:

```text
~/Projetos/bolao-hm-semeando-amor
```

Organizacao:

```text
client/                  Frontend React/Vite
client/public/assets/    Assets usados diretamente pela aplicacao
server/                  API Express
db/init/                 Scripts SQL de criacao e carga inicial
shared/                  Constantes/codigo compartilhado
patches/                 Patches de dependencias pnpm
docs/                    Documentacao local do projeto
assets/brand/originals/  Logos originais recebidos
assets/photos/originals/ Fotos/arquivos originais recebidos
archives/                Pacotes baixados e copias antigas preservadas
```

Arquivos movidos de Downloads:

```text
assets/brand/originals/Hm_logo.jpeg
assets/brand/originals/Semeando_Logo.jpeg
assets/photos/originals/foto_HM.zip
archives/imported-downloads/bolao-hm-copa.zip
archives/imported-downloads/bolao-hm-copa-original/
```

Comandos principais:

```bash
cd ~/Projetos/bolao-hm-semeando-amor
pnpm run dev
pnpm run api
pnpm run build
pnpm run check
docker compose up -d
```

URLs locais:

```text
App:     http://localhost:3000
Adminer: http://localhost:8081
Postgres: localhost:5433
```
