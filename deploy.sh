#!/bin/bash

# Este script sube los archivos modificados a tu servidor Hostinger
# y reinicia el contenedor de la aplicación.

echo "🚀 Iniciando despliegue hacia Hostinger..."

echo "📦 1. Sincronizando archivos con el servidor (rsync)..."
rsync -avz -e "ssh -i ~/.ssh/hostinger_deploy_rsa -o StrictHostKeyChecking=no" \
  --exclude node_modules \
  --exclude .git \
  --exclude dist \
  --exclude deploy.sh \
  ./ root@31.97.8.208:/dockerDoc/person/

echo "🐳 2. Reconstruyendo y reiniciando el contenedor de la aplicación..."
ssh -i ~/.ssh/hostinger_deploy_rsa -o StrictHostKeyChecking=no root@31.97.8.208 \
"cd /dockerDoc/person && (docker compose up -d --build app || docker-compose up -d --build app)"

echo "✅ ¡Despliegue completado! Los cambios ya están en vivo en http://31.97.8.208"
