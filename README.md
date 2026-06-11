# UK VAT Number Validator API

Real-time UK VAT number validation via HMRC's official API. No API key required.

## Endpoints

### `POST /api/validate`

**Request:**
```json
{ "vat_number": "GB123456789" }
```

Accepts: `GB123456789`, `123456789`, `GB 123 456 789`, `XI123456789`

**Response (valid):**
```json
{
  "valid": true,
  "vat_number": "GB123456789",
  "normalised": "123456789",
  "business_name": "EXAMPLE LTD",
  "address": { "line1": "...", "postcode": "SW1A 1AA", "country_code": "GB" },
  "consultation_number": "ABC123456789",
  "request_date": "2026-06-11T10:00:00Z",
  "source": "hmrc"
}
```

**Response (invalid):**
```json
{ "valid": false, "vat_number": "GB000000000", "normalised": "000000000", "source": "hmrc" }
```

### `GET /api/health`

Service status.

## Pricing

| Plan  | Requests/mo | Price  |
|-------|-------------|--------|
| Free  | 100         | $0     |
| Basic | 10,000      | $9/mo  |
| Pro   | 100,000     | $29/mo |
| Ultra | 500,000     | $79/mo |

## Why this API?

- Wraps HMRC's official validation endpoint directly
- Handles all formats (GB prefix, spaces, dashes, XI for Northern Ireland)
- Returns business name + address, not just valid/invalid
- Post-Brexit gap: EU VIES no longer covers UK registrations

## Dev

```bash
npm install && npm run dev
```

No environment variables needed.
