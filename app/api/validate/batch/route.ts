import { NextRequest, NextResponse } from "next/server";

const isSandbox = process.env.HMRC_ENVIRONMENT === "sandbox";
const HMRC_BASE = isSandbox
  ? "https://test-api.service.hmrc.gov.uk"
  : "https://api.service.hmrc.gov.uk";
const HMRC_TOKEN_URL = `${HMRC_BASE}/oauth/token`;
const HMRC_VAT_URL = `${HMRC_BASE}/organisations/vat/check-vat-number/lookup`;

let cachedToken: { value: string; expiresAt: number } | null = null;

function getCredentials() {
  const clientId = process.env.HMRC_CLIENT_ID;
  const clientSecret = process.env.HMRC_CLIENT_SECRET;
  if (!clientId || !clientSecret) throw new Error("HMRC credentials not configured.");
  return { clientId, clientSecret };
}

async function getAccessToken(): Promise<string> {
  if (cachedToken && Date.now() < cachedToken.expiresAt - 60_000) return cachedToken.value;
  const { clientId, clientSecret } = getCredentials();
  const res = await fetch(HMRC_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "client_credentials",
      client_id: clientId,
      client_secret: clientSecret,
    }),
  });
  if (!res.ok) throw new Error(`Token request failed (${res.status})`);
  const data = await res.json();
  cachedToken = {
    value: data.access_token,
    expiresAt: Date.now() + (data.expires_in ?? 14400) * 1000,
  };
  return cachedToken.value;
}

function normaliseVat(raw: string): string {
  let vat = raw.toUpperCase().replace(/[\s\-\.]/g, "");
  if (vat.startsWith("GB") || vat.startsWith("XI")) vat = vat.slice(2);
  return vat;
}

function isValidFormat(vat: string): boolean {
  return (
    /^\d{9}$/.test(vat) ||
    /^\d{12}$/.test(vat) ||
    /^GD\d{3}$/.test(vat) ||
    /^HA\d{3}$/.test(vat)
  );
}

async function validateOne(
  raw: string,
  token: string
): Promise<Record<string, unknown>> {
  const normalised = normaliseVat(raw);

  if (!isValidFormat(normalised)) {
    return {
      vat_number: raw,
      normalised,
      valid: false,
      error: "Invalid format",
      source: "format_check",
    };
  }

  try {
    const res = await fetch(`${HMRC_VAT_URL}/${normalised}`, {
      headers: {
        Accept: "application/vnd.hmrc.2.0+json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (res.status === 404) {
      return { vat_number: raw, normalised, valid: false, source: "hmrc" };
    }

    if (!res.ok) {
      return {
        vat_number: raw,
        normalised,
        valid: false,
        error: `HMRC error ${res.status}`,
        source: "hmrc",
      };
    }

    const data = await res.json();
    const target = data.target || {};
    const addr = target.address || null;

    return {
      vat_number: raw,
      normalised,
      valid: true,
      business_name: target.name || null,
      address: addr
        ? {
            line1: addr.line1 || null,
            line2: addr.line2 || null,
            postcode: addr.postCode || null,
            country_code: addr.countryCode || null,
          }
        : null,
      request_date: data.processingDate || null,
      source: "hmrc_v2",
    };
  } catch {
    return {
      vat_number: raw,
      normalised,
      valid: false,
      error: "Request failed",
      source: "hmrc",
    };
  }
}

export async function POST(req: NextRequest) {
  let body: { vat_numbers?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  if (!Array.isArray(body.vat_numbers)) {
    return NextResponse.json(
      { error: "vat_numbers must be an array of strings." },
      { status: 400 }
    );
  }

  const raw = body.vat_numbers as unknown[];

  if (raw.length === 0) {
    return NextResponse.json({ error: "vat_numbers array is empty." }, { status: 400 });
  }

  if (raw.length > 50) {
    return NextResponse.json(
      { error: "Maximum 50 VAT numbers per batch.", received: raw.length },
      { status: 400 }
    );
  }

  const strings = raw.map((v) => String(v).trim()).filter(Boolean);

  let token: string;
  try {
    token = await getAccessToken();
  } catch (err: unknown) {
    return NextResponse.json(
      {
        error: "HMRC authentication failed.",
        detail: err instanceof Error ? err.message : "Unknown error",
      },
      { status: 503 }
    );
  }

  // HMRC rate-limits UK VAT checks to 3 req/s
  // Process in chunks of 3 with 400ms gap between chunks
  const CHUNK_SIZE = 3;
  const CHUNK_DELAY_MS = 400;
  const results: Record<string, unknown>[] = [];

  for (let i = 0; i < strings.length; i += CHUNK_SIZE) {
    const chunk = strings.slice(i, i + CHUNK_SIZE);
    const chunkResults = await Promise.all(chunk.map((v) => validateOne(v, token)));
    results.push(...chunkResults);
    if (i + CHUNK_SIZE < strings.length) {
      await new Promise((resolve) => setTimeout(resolve, CHUNK_DELAY_MS));
    }
  }

  const validCount = results.filter((r) => r.valid === true).length;
  const invalidCount = results.filter((r) => r.valid === false).length;

  return NextResponse.json({
    total: strings.length,
    valid: validCount,
    invalid: invalidCount,
    results,
  });
}

export async function GET() {
  return NextResponse.json(
    {
      error: "Method not allowed.",
      hint: 'POST { "vat_numbers": ["GB123456789", "XI987654321"] } — max 50 per request.',
    },
    { status: 405 }
  );
}
