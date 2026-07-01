#!/usr/bin/env bash
set -e

echo "▶ Démarrage de PostgreSQL..."
docker compose up -d

echo "⏳ Attente que PostgreSQL soit prêt..."
until docker exec gestion_asso_postgres pg_isready -U postgres > /dev/null 2>&1; do
  sleep 1
done
echo "✓ PostgreSQL prêt."

echo "▶ Génération du client Prisma..."
npx prisma generate

echo "▶ Application des migrations..."
npx prisma migrate deploy

echo "▶ Seed de la base de données..."
node prisma/seed.mjs

echo "✓ Base initialisée. Démarrage du serveur..."
npx next dev --hostname 0.0.0.0
