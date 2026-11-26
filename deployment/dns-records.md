# DNS Records — De Royal Hotspot OS

> [!IMPORTANT]
> Configure these DNS records at your domain registrar or DNS provider for `deroyalhotspot.name.ng`.
> Replace `YOUR_SERVER_IP` with the public IPv4 address of your VPS.
> DNS changes typically propagate within 1–48 hours.

## Required A Records

| Hostname                       | Type | Value           | TTL  | Purpose                        |
|-------------------------------|------|-----------------|------|-------------------------------|
| `deroyalhotspot.name.ng`       | A    | `YOUR_SERVER_IP` | 3600 | Public website + captive portal + legacy admin |
| `app.deroyalhotspot.name.ng`   | A    | `YOUR_SERVER_IP` | 3600 | ISP business dashboard         |
| `platform.deroyalhotspot.name.ng` | A | `YOUR_SERVER_IP` | 3600 | DHOS Super Admin console       |
| `account.deroyalhotspot.name.ng` | A  | `YOUR_SERVER_IP` | 3600 | Customer self-service portal   |
| `api.deroyalhotspot.name.ng`   | A    | `YOUR_SERVER_IP` | 3600 | Backend API (optional direct)  |

## Optional Wildcard Alternative

If your DNS provider supports wildcard records, you can use a single wildcard instead of five individual records:

| Hostname                   | Type | Value           | TTL  |
|---------------------------|------|-----------------|------|
| `*.deroyalhotspot.name.ng` | A    | `YOUR_SERVER_IP` | 3600 |
| `deroyalhotspot.name.ng`   | A    | `YOUR_SERVER_IP` | 3600 |

> [!NOTE]
> A wildcard covers `app.*`, `platform.*`, `account.*`, `api.*` automatically.
> You still need an explicit A record for the apex domain (`deroyalhotspot.name.ng`).

## Verify DNS Propagation

```bash
# Check each subdomain resolves to your server IP
dig +short deroyalhotspot.name.ng
dig +short app.deroyalhotspot.name.ng
dig +short platform.deroyalhotspot.name.ng
dig +short account.deroyalhotspot.name.ng
dig +short api.deroyalhotspot.name.ng

# Or using nslookup on Windows
nslookup app.deroyalhotspot.name.ng
```

## MX Records (Email — existing, do not change)

Do not modify your existing MX records if you have email configured for `deroyalhotspot.name.ng`.
