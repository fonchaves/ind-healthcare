#!/bin/sh
set -e

echo "🚀 Starting application initialization..."

# Run Prisma migrations
echo "📦 Running database migrations..."
pnpm exec prisma migrate deploy

# Check if database is already seeded
echo "🔍 Checking if database needs seeding..."
RECORD_COUNT=$(node -e "
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
prisma.sragCase.count()
  .then(count => {
    console.log(count);
    prisma.\$disconnect();
  })
  .catch(err => {
    console.log(0);
    prisma.\$disconnect();
    process.exit(0);
  });
")

if [ "$RECORD_COUNT" -eq 0 ]; then
  echo "🌱 Database is empty. Running seed with FULL dataset..."
  USE_FULL_DATA=true node dist/database/seed.js
  echo "✅ Seed completed successfully!"
else
  echo "✅ Database already contains $RECORD_COUNT records. Skipping seed."
fi

# Start the application
echo "🎯 Starting NestJS application..."
exec node dist/main.js
