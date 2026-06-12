# OVH Bare Metal Deployment Guide

This guide deploys the Java mail gateway on a Linux bare metal server and keeps it reachable from Cloudflare.

## 1) Prerequisites on server

Install:
- Docker Engine
- Docker Compose plugin
- UFW (or nftables)

Open ports:
- `22/tcp` (SSH)
- `80/tcp` (ACME + redirect)
- `443/tcp` (API HTTPS)

## 2) DNS and Cloudflare

Create DNS record:
- Type: `A`
- Name: `mail-api` (or your preferred host)
- Target: your OVH server public IP

Cloudflare mode:
- Keep proxied (orange cloud) if you want WAF/protection.
- SSL/TLS mode in Cloudflare: **Full (strict)**.

## 3) Configure environment

From this folder, copy the env file:

```bash
cp .env.example .env
```

Edit `.env` values:
- `DOMAIN` -> your FQDN (`mail-api.yourdomain.com`)
- `CERTBOT_EMAIL` -> ops email
- `MAIL_GATEWAY_API_KEY` -> long random key
- SMTP settings (`SMTP_HOST`, `SMTP_USERNAME`, `SMTP_PASSWORD`, ...)

## 4) Start application stack

```bash
docker compose up -d mail-gateway nginx
```

## 5) Create TLS certificates

```bash
chmod +x ./init-letsencrypt.sh ./renew-certs.sh
./init-letsencrypt.sh
```

## 6) Verify

Health endpoint:

```bash
curl -i https://$DOMAIN/actuator/health
```

Mail send endpoint test:

```bash
curl -i https://$DOMAIN/v1/mail/send \
  -H "Content-Type: application/json" \
  -H "X-Api-Key: $MAIL_GATEWAY_API_KEY" \
  -d '{
    "to": ["owner@example.com"],
    "subject": "Mail gateway test",
    "text": "Test from OVH deployment"
  }'
```

## 7) Wire Supabase function to this service

Set secrets for `notify-lead-email`:
- `MAIL_SERVICE_URL=https://mail-api.yourdomain.com`
- `MAIL_SERVICE_API_KEY=<same key as MAIL_GATEWAY_API_KEY>`
- `LEADS_NOTIFY_TO=<owner email>`
- `LEADS_NOTIFY_FROM=Agathaba <devis@agathaba.com>`

## 8) Automatic certificate renew

Add a cron job:

```bash
crontab -e
```

Example (every day at 03:12):

```cron
12 3 * * * cd /opt/mail-gateway/deploy && ./renew-certs.sh >> /var/log/mail-gateway-cert-renew.log 2>&1
```

## 9) Hardening recommendations

- Allow only `80/443` publicly (and `22` for SSH).
- Use SSH key auth, disable password login.
- Keep API key secret and rotate regularly.
- Keep Docker images and system packages updated.
- Configure SPF, DKIM and DMARC for your sender domain.
- Monitor logs and 5xx rates.

## 10) Cloudflare note

Your website can remain hosted on Cloudflare, and this API can run on OVH.
The call path is server-to-server from Supabase Edge Function to this API URL.
