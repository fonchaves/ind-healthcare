#!/bin/bash

# Script para visualizar logs do CapRover
# Uso: ./scripts/caprover-logs.sh

APP_NAME="ind-healthcare-api"
CAPROVER_NAME="captain-01"

echo "📋 Buscando logs da aplicação: $APP_NAME"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Usar API do CapRover para buscar logs
caprover api \
  --caproverName "$CAPROVER_NAME" \
  --path "/user/apps/appData/$APP_NAME" \
  --method GET \
  | jq -r '.data.logs // "Sem logs disponíveis"'

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "💡 Para ver logs em tempo real, acesse:"
echo "   http://captain.cloud.fonchaves.com/"
echo "   → Apps → $APP_NAME → App Logs"
