# UK VAT Number Validator API

Real-time UK VAT validation via HMRC's official v2 API. Returns business name, registered address,
and an optional government-issued consultation number for audit trails.

## Endpoints

### `POST /api/validate`

**Basic check:**
```json
{ "vat_number": "GB123456789" }
```

**Verified check (returns consultation number for audit records):**
```json
{
  "vat_number": "GB123456789",
  "requester_vat_number": "GB987654321"
}
```

**Accepted input formats:**

| Format | Description |
|--------|-------------|
| `GB123456789` | Standard with GB prefix |
| `XI123456789` | Northern Ireland (XI prefix) |
| `123456789` | No prefix — also accepted |
| `GB 123 456 789` | Spaces stripped automatically |
| `123456789012` | Branch trader (12 digits) |
| `GD123` | Government department |
| `HA123` | Health authority |

**Response (valid):**
```json
{
  "valid": true,
  "vat_number": "GB123456789",
  "normalised": "123456789",
  "business_name": "EXAMPLE LTD",
  "address": {
    "line1": "1 Example Street",
    "line2": null,
    "line3": null,
    "postcode": "SW1A 1AA",
    "country_code": "GB"
  },
  "consultation_number": "ABC123456789",
  "request_date": "2026-06-11T10:00:00Z",
  "verified_check": true,
  "source": "hmrc_v2"
}
```

**Response (invalid):**
```json
{ "valid": false, "vat_number": "GB000000000", "normalised": "000000000", "source": "hmrc" }
```

**Response (bad format):**
```json
{
  "valid": false,
  "vat_number": "notaVAT",
  "error": "Invalid VAT number format...",
  "source": "format_check"
}
```

### `GET /api/health`

Returns service status.

## Setup (required)

This API wraps HMRC's v2 VAT validation endpoint, which requires registered credentials.

1. Register at the [HMRC Developer Hub](https://developer.service.hmrc.gov.uk/developer/registration) (~2 weeks for production approval)
2. Create an application and subscribe to the **Check a UK VAT Number API (v2)**
3. Get your `client_id` and `client_secret`
4. Add to Vercel environment variables:

```
HMRC_CLIENT_ID=your_client_id
HMRC_CLIENT_SECRET=your_client_secret
```

The API handles OAuth2 `client_credentials` token fetching and caching automatically. Tokens are valid for 4 hours and reused across requests.

**Local dev:**
```bash
npm install
# Create .env.local with HMRC_CLIENT_ID and HMRC_CLIENT_SECRET
npm run dev
```

**HMRC sandbox** (for testing before production approval):
Use `https://test-api.service.hmrc.gov.uk` instead. Point `HMRC_TOKEN_URL` and `HMRC_VAT_URL` at the test URLs.

## Pricing (RapidAPI)

| Plan   | Requests/month | Price   |
|--------|---------------|---------|
| Free   | 100           | $0      |
| Basic  | 10,000        | $9/mo   |
| Pro    | 100,000       | $29/mo  |
| Ultra  | 500,000       | $79/mo  |

## Why use this API?

- Backed by HMRC v2 (v1 was removed Feb 2025 — many competitors still document the broken v1)
- Handles all UK VAT formats including GB/XI prefix, spaces, dashes, branch trader, GD/HA
- Returns full business name + address — not just valid/invalid
- Supports verified checks with government-issued consultation numbers for audit trails
- OAuth2 token caching — no per-request auth overhead
