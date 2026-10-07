#!/bin/bash
# Uso: ./iniciar.sh
# Arranca la API (4000) y la página (3000) juntas. Ctrl+C apaga las dos.
RAIZ="$(cd "$(dirname "$0")" && pwd)"

liberar_puertos() {
  for p in 3000 4000; do
    pids=$(lsof -ti tcp:$p 2>/dev/null)
    [ -n "$pids" ] && kill $pids 2>/dev/null
  done
  sleep 1
}
echo "▶ Apagando servidores viejos en 3000 y 4000…"
liberar_puertos

(cd "$RAIZ/api" && npx tsx server.ts) &
API_PID=$!
trap 'kill $API_PID 2>/dev/null; liberar_puertos; exit 0' INT TERM EXIT

cd "$RAIZ/web"
echo "▶ Construyendo la página…"
npm run build || exit 1
echo ""
echo "✅ Abre http://localhost:3000 en Chrome  (Ctrl+C para apagar)"
npm start
