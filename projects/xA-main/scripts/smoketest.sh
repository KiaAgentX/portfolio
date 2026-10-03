#!/bin/sh
set -e
BASE="${PUBLIC_BASE_URL:-http://localhost:8080}"
echo "health:"
curl -fsS "$BASE/health"
echo
echo "login:"
TOKEN=$(curl -fsS -X POST "$BASE/api/auth/login" -H 'content-type: application/json' \
  -d '{"email":"admin@local","password":"changeme"}' | python -c "import sys,json; print(json.load(sys.stdin)['access_token'])")
echo "token ok"
echo "telegram webhook:"
curl -fsS -X POST "$BASE/webhooks/telegram" \
  -H "X-Telegram-Bot-Api-Secret-Token: ${TELEGRAM_CUSTOMER_SECRET_TOKEN:-change-me-telegram-secret}" \
  -H 'content-type: application/json' \
  -d '{"message":{"message_id":1,"text":"ما لزوجة SAE المناسبة لمحرك ديزل ثقيل في الصيف؟","from":{"id":99,"first_name":"اختبار"},"chat":{"id":99}}}'
echo
echo "queue:"
curl -fsS "$BASE/api/tickets?status=awaiting_approval" -H "Authorization: Bearer $TOKEN"
echo
echo "smoketest done"
