# SSL/TLS Setup — De Royal Hotspot OS

> [!IMPORTANT]
> Complete DNS configuration first. All subdomains must resolve to your server before SSL can be issued.

## Install Certbot (Let's Encrypt)

```bash
sudo apt update
sudo apt install -y certbot python3-certbot-apache
```

## Option A — Wildcard Certificate (Recommended)

A single wildcard certificate covers `*.deroyalhotspot.name.ng` and all subdomains.

> [!NOTE]
> Wildcard certificates require DNS-01 challenge. You need API access to your DNS provider, or you must add a TXT record manually.

### Manual DNS challenge (works with any DNS provider)

```bash
sudo certbot certonly \
  --manual \
  --preferred-challenges dns \
  -d "deroyalhotspot.name.ng" \
  -d "*.deroyalhotspot.name.ng"
```

Certbot will display a TXT record to add to your DNS:
```
_acme-challenge.deroyalhotspot.name.ng  TXT  "<challenge-value>"
```

Add the TXT record at your registrar, wait 60 seconds for propagation, then press Enter to continue.

The certificate files will be saved at:
- **Certificate:** `/etc/letsencrypt/live/deroyalhotspot.name.ng/fullchain.pem`
- **Private key:** `/etc/letsencrypt/live/deroyalhotspot.name.ng/privkey.pem`

These paths are already referenced in `apache-vhosts.conf`.

### Reload Apache

```bash
sudo systemctl reload apache2
```

---

## Option B — Individual Certificates (Simpler, no DNS API needed)

If you cannot do a wildcard cert, issue one certificate covering all subdomains:

```bash
sudo certbot --apache \
  -d deroyalhotspot.name.ng \
  -d app.deroyalhotspot.name.ng \
  -d platform.deroyalhotspot.name.ng \
  -d account.deroyalhotspot.name.ng \
  -d api.deroyalhotspot.name.ng
```

Certbot will modify your Apache config automatically and enable HTTPS.

---

## Auto-Renewal

Certbot installs a systemd timer for automatic renewal. Verify it is active:

```bash
sudo systemctl status certbot.timer
```

Test renewal without actually renewing:
```bash
sudo certbot renew --dry-run
```

---

## Verify SSL After Setup

```bash
# Test each subdomain
curl -I https://deroyalhotspot.name.ng
curl -I https://app.deroyalhotspot.name.ng
curl -I https://platform.deroyalhotspot.name.ng
curl -I https://account.deroyalhotspot.name.ng
```

Expected response header: `HTTP/2 200`

---

## Enable Required Apache Modules

```bash
sudo a2enmod ssl proxy proxy_http rewrite headers
sudo systemctl reload apache2
```

---

## Local Development (No SSL Required)

For local dev, use the `?mode=` query parameter — no SSL or subdomain setup needed:

| URL | Interface |
|-----|-----------|
| `http://localhost:5173/?mode=app` | ISP Dashboard |
| `http://localhost:5173/?mode=platform` | Super Admin |
| `http://localhost:5173/?mode=account` | Customer portal |
| `http://localhost:5173/connect` | Captive portal |
| `http://localhost:5173/admin` | Legacy admin |
