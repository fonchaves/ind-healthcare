#!/bin/sh
set -e

# Version: 2.0 - App starts before seed
echo "🚀 Starting application initialization..."

# Run Prisma migrations
echo "📦 Running database migrations..."
pnpm exec prisma migrate deploy

# Start the application first (in background)
echo "🎯 Starting NestJS application..."
node dist/main.js &
APP_PID=$!

# Wait a bit for app to start
sleep 5

# Check if database needs seeding and run in background if needed
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
  echo "🌱 Database is empty. Starting seed in BACKGROUND..."
  echo "⚠️  The API is already running. Data will populate over the next 10-30 minutes."
  (
    sleep 2  # Give app more time to stabilize
    USE_FULL_DATA=true node dist/database/seed.js 2>&1 | while IFS= read -r line; do echo "[SEED] $line"; done && \
    echo "✅ Background seed completed successfully!"
  ) &
else
  echo "✅ Database already contains $RECORD_COUNT records. Skipping seed."
fi

# Wait for the main application process
wait $APP_PID
