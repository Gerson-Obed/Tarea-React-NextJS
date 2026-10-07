#!/bin/bash
# Uso:  ./medir.sh antes    o    ./medir.sh despues
# Arranca la API y la web (build de producción), corre Lighthouse y apaga todo.
set -e
NOMBRE="${1:-antes}"
RAIZ="$(cd "$(dirname "$0")" && pwd)"
mkdir -p "$RAIZ/lighthouse"

liberar_puertos() {
  for p in 3000 4000; do
    pids=$(lsof -ti tcp:$p 2>/dev/null)
    [ -n "$pids" ] && kill $pids 2>/dev/null
  done
  sleep 1
}
echo "▶ Apagando servidores viejos en 3000 y 4000…"
liberar_puertos

echo "▶ Arrancando la API (puerto 4000)…"
(cd "$RAIZ/api" && npx tsx server.ts > "$RAIZ/lighthouse/api.log" 2>&1) &
API_PID=$!

echo "▶ Construyendo la web (npm run build)…"
(cd "$RAIZ/web" && npm run build > "$RAIZ/lighthouse/build.log" 2>&1) || { echo "❌ Falló el build, mira lighthouse/build.log"; kill $API_PID; exit 1; }

echo "▶ Arrancando la web en producción (puerto 3000)…"
(cd "$RAIZ/web" && npm start > "$RAIZ/lighthouse/web.log" 2>&1) &
WEB_PID=$!

apagar() { kill $WEB_PID $API_PID 2>/dev/null; liberar_puertos; }
trap apagar EXIT

for i in $(seq 1 60); do
  if curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 | grep -q 200; then break; fi
  sleep 1
done
curl -s -o /dev/null -w "▶ La página responde: %{http_code}\n" http://localhost:3000

echo "▶ Corriendo Lighthouse ($NOMBRE)…"
npx -y lighthouse@12 http://localhost:3000 --preset=desktop \
  --output=html --output=json --chrome-flags=--headless \
  --output-path="$RAIZ/lighthouse/$NOMBRE" --quiet

echo "✅ Listo: lighthouse/$NOMBRE.report.html"
