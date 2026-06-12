#!/usr/bin/env sh
set -eu

if [ ! -f .env ]; then
  echo "Missing .env file."
  exit 1
fi

# shellcheck disable=SC1091
. ./.env

if [ -z "${DOMAIN:-}" ]; then
  echo "DOMAIN must be defined in .env"
  exit 1
fi

docker compose run --rm certbot renew --webroot -w /var/www/certbot
docker compose exec nginx nginx -s reload

echo "Certificates renewed and nginx reloaded."
