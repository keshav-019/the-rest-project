# The REST Project

## Docker Quick Start (Recommended for Windows)

This repo is dockerized so you can run it without installing native build tooling locally.

1. Install [Docker Desktop](https://www.docker.com/products/docker-desktop/).
2. From the project root, run:

```bash
docker compose up --build
```

3. Open:

[http://localhost:1500](http://localhost:1500)

The app is mapped to port `1500` by default.

If your database runs on your Windows host machine, keep using `localhost` in the app connection form. Inside Docker this is auto-mapped to `host.docker.internal`.

## Useful Docker Commands

Stop containers:

```bash
docker compose down
```

Rebuild and restart:

```bash
docker compose up --build --force-recreate
```

## Local (Non-Docker) Development

If you still want to run locally:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).
