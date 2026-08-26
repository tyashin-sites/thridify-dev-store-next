# Woodlark — Next.js Worker (Tyashin-managed)

Per-project Next.js / OpenNext storefront for the Tyashin project
`6a1c9aa66933b758bf066427` (`varun-website-mpu8jd7d`).

## Local dev

```bash
nvm use 24
npm install
TYASHIN_API_KEY="ak_..." npm run dev
```

## Build + deploy to Cloudflare

```bash
nvm use 24
TYASHIN_API_KEY="ak_..." \
TYASHIN_API_URL="https://website-api.tyashin.com" \
TYASHIN_STOREFRONT_URL="https://website-api.tyashin.com/api/v1/public/ecommerce" \
PROJECT_ID="6a1c9aa66933b758bf066427" \
SITE_DOMAIN="woodlarkveneer.com" \
ROBOTS_NOINDEX="true" \
  npx @opennextjs/cloudflare build

npx @opennextjs/cloudflare deploy
```

## Changing the customer domain

Update **one** place — `SITE_DOMAIN` env var on the build + `wrangler.jsonc` `vars.SITE_DOMAIN`.
Everything else (canonicals, OG URLs, JSON-LD URLs) reads from `siteConfig.domain` in `src/lib/site.ts`,
which reads from `NEXT_PUBLIC_SITE_DOMAIN`. Rebuild and redeploy.

## Production cutover (when the customer domain is confirmed)

```bash
# 1. Flip the project to nextjs framework
curl -X PATCH "https://website-api.tyashin.com/api/v1/projects/6a1c9aa66933b758bf066427" \
  -H "Authorization: Bearer $JWT" -H "Content-Type: application/json" \
  -d '{"framework":"nextjs"}'

# 2. Point hostnames at this Worker
curl -X PUT "https://website-api.tyashin.com/api/v1/projects/6a1c9aa66933b758bf066427/experimental-deployment" \
  -H "Authorization: Bearer $JWT" -H "Content-Type: application/json" \
  -d '{"scriptName":"site-woodlark-luxury-veneers-next","hostnames":["www.woodlarkveneer.com","woodlarkveneer.com"],"label":"v1-production"}'
```

## One-curl rollback

```bash
curl -X PUT "https://website-api.tyashin.com/api/v1/projects/6a1c9aa66933b758bf066427/experimental-deployment" \
  -H "Authorization: Bearer $JWT" -H "Content-Type: application/json" \
  -d '{"scriptName":"site-woodlark-luxury-veneers-next","hostnames":[],"label":"rollback"}'
```
