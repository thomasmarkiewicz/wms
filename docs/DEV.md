# Development Setup

## Start PostgreSQL

```bash
docker-compose up -d
```

## Generate Prisma Client

```bash
bun db:generate
```

## Run first migration

```bash
bun db:migrate
```

## Start both apps

```bash
bun dev
```
