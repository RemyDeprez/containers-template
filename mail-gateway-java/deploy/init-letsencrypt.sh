#!/usr/bin/env sh
set -eu

if [ ! -f .env ]; then
  echo "Missing .env file. Copy .env.example to .env first."
  exit 1
fi

# shellcheck disable=SC1091
. ./.env

if [ -z "${DOMAIN:-}" ] || [ -z "${CERTBOT_EMAIL:-}" ]; then
  echo "DOMAIN and CERTBOT_EMAIL must be defined in .env"
  exit 1
fi

echo "Starting nginx for ACME challenge..."
docker compose up -d nginx

echo "Requesting/renewing first certificate for ${DOMAIN}..."
docker compose run --rm certbot certonly \
  --webroot -w /var/www/certbot \
  --email "${CERTBOT_EMAIL}" \
  --agree-tos \
  --no-eff-email \
  -d "${DOMAIN}"

echo "Reloading nginx with fresh certificates..."
docker compose exec nginx nginx -s reload

echo "Certificate setup complete."
