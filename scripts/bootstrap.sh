#!/usr/bin/env bash
set -e

# Crée .env.local depuis l'exemple si absent
if [ ! -f .env.local ]; then
  cp .env.example .env.local
  echo "✓ .env.local créé depuis .env.example — vérifiez les variables si nécessaire."
fi

echo "▶ Démarrage de PostgreSQL..."
docker compose up -d

echo "⏳ Attente que PostgreSQL soit prêt..."
until docker exec gestion_asso_postgres pg_isready -U postgres > /dev/null 2>&1; do
  sleep 1
done
echo "✓ PostgreSQL prêt."

echo "▶ Application des migrations..."
npx prisma migrate deploy

echo "▶ Seed de la base de données..."
npx prisma db seed

echo ""
echo "✓ Base initialisée. Lancez 'npm run dev' pour démarrer."
