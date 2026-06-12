# Mail Gateway (Java)

Reusable, self-hosted mail API for any project.

This service exposes one endpoint:
- `POST /v1/mail/send`

It sends email through SMTP and protects access with an API key.

## Why this service

- No dependency on Resend.
- Can be shared across multiple projects.
- Your app only calls a stable HTTP API.

## API contract

### Request

`POST /v1/mail/send`

Headers:
- `Content-Type: application/json`
- `X-Api-Key: <MAIL_GATEWAY_API_KEY>`

Body:

```json
{
  "from": "Agathaba <devis@agathaba.com>",
  "to": ["owner@example.com"],
  "cc": ["cc@example.com"],
  "bcc": ["audit@example.com"],
  "subject": "New lead",
  "text": "Optional text version",
  "html": "<h1>Optional HTML version</h1>",
  "replyTo": "client@example.com",
  "headers": {
    "X-Lead-Id": "uuid",
    "X-Lead-Source": "website"
  }
}
```

Rules:
- `to` and `subject` are required.
- At least one of `text` or `html` is required.
- If `from` is missing, `MAIL_GATEWAY_DEFAULT_FROM` is used.

### Response

```json
{
  "accepted": true,
  "messageId": "<smtp-message-id>"
}
```

## Configuration

Environment variables:

- `PORT` (default `8080`)
- `MAIL_GATEWAY_API_KEY` (required in production)
- `MAIL_GATEWAY_DEFAULT_FROM` (default sender)
- `SMTP_HOST`
- `SMTP_PORT` (default `587`)
- `SMTP_USERNAME`
- `SMTP_PASSWORD`
- `SMTP_AUTH` (`true`/`false`)
- `SMTP_STARTTLS` (`true`/`false`)
- `SMTP_STARTTLS_REQUIRED` (`true`/`false`)

## Run locally

```bash
mvn spring-boot:run
```

## Build jar

```bash
mvn -DskipTests package
java -jar target/mail-gateway-1.0.0.jar
```

## Docker

```bash
docker build -t mail-gateway-java .
docker run -p 8080:8080 \
  -e MAIL_GATEWAY_API_KEY=replace-me \
  -e MAIL_GATEWAY_DEFAULT_FROM="Agathaba <devis@agathaba.com>" \
  -e SMTP_HOST=smtp.example.com \
  -e SMTP_PORT=587 \
  -e SMTP_USERNAME=user \
  -e SMTP_PASSWORD=pass \
  mail-gateway-java
```

## Production hardening checklist

- Put the service behind HTTPS (reverse proxy or load balancer).
- Restrict incoming IPs to trusted callers when possible.
- Use a strong random API key and rotate it.
- Enable SMTP DKIM/SPF/DMARC on your domain.
- Add metrics/log aggregation and alerts.
