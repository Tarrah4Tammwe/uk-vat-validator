import { NextRequest, NextResponse } from "next/server";

const isSandbox = process.env.HMRC_ENVIRONMENT === "sandbox";
const HMRC_BASE = isSandbox
  ? "https://test-api.service.hmrc.gov.uk"
  : "https://api.service.hmrc.gov.uk";
const HMRC_TOKEN_URL = `${HMRC_BASE}/oauth/token`;
const HMRC_VAT_URL = `${HMRC_BASE}/organisations/vat/check-vat-number/lookup`;

// In-memory token cache (lives for the duration of the serverless function warm instance)
// Tokens are valid for 4 hours per HMRC docs
let cachedToken: { value: string; expiresAt: number } | null = null;

function getCredentials(): { clientId: string; clientSecret: string } {
  const clientId = process.env.HMRC_CLIENT_ID;
  const clientSecret = process.env.HMRC_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    throw new Error("HMRC_CLIENT_ID and HMRC_CLIENT_SECRET environment variables are required.");
  }
  return { clientId, clientSecret };
}

async function getAccessToken(): Promise<string> {
  // Return cached token if still valid (with 60s buffer)
  if (cachedToken && Date.now() < cachedToken.expiresAt - 60_000) {
    return cachedToken.value;
  }

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

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`HMRC token request failed (${res.status}): ${text}`);
  }

  const data = await res.json();
  cachedToken = {
    value: data.access_token,
    expiresAt: Date.now() + (data.expires_in ?? 14400) * 1000,
  };

  return cachedToken.value;
}

function normaliseVat(raw: string): string {
  let vat = raw.toUpperCase().replace(/[\s\-\.]/g, "");
  // Strip GB or XI prefix — HMRC v2 accepts the number without prefix
  if (vat.startsWith("GB") || vat.startsWith("XI")) {
    vat = vat.slice(2);
  }
  return vat;
}

function isValidFormat(vat: string): { valid: boolean; error?: string } {
  if (/^\d{9}$/.test(vat)) return { valid: true };        // Standard: 9 digits
  if (/^\d{12}$/.test(vat)) return { valid: true };       // Branch trader: 12 digits
  if (/^GD\d{3}$/.test(vat)) return { valid: true };      // Government dept: GD + 3 digits
  if (/^HA\d{3}$/.test(vat)) return { valid: true };      // Health authority: HA + 3 digits
  return {
    valid: false,
    error:
      "Invalid VAT number format. Expected: 9-digit standard (e.g. 123456789), " +
      "12-digit branch trader, GD + 3 digits (government), or HA + 3 digits (health authority). " +
      "GB/XI prefix is accepted and stripped automatically.",
  };
}

export async function POST(req: NextRequest) {
  // Parse body
  let body: { vat_number?: string; requester_vat_number?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const raw = body.vat_number?.toString().trim();
  if (!raw) {
    return NextResponse.json({ error: "vat_number is required." }, { status: 400 });
  }

  const normalised = normaliseVat(raw);
  const formatCheck = isValidFormat(normalised);

  if (!formatCheck.valid) {
    return NextResponse.json(
      {
        valid: false,
        vat_number: raw,
        normalised,
        error: formatCheck.error,
        source: "format_check",
      },
      { status: 200 }
    );
  }

  // Optional: requester VAT for verified (auditable) lookup
  const requesterRaw = body.requester_vat_number?.toString().trim();
  const requesterNormalised = requesterRaw ? normaliseVat(requesterRaw) : null;

  // Get HMRC OAuth token
  let token: string;
  try {
    token = await getAccessToken();
  } catch (err: unknown) {
    return NextResponse.json(
      {
        error: "Authentication with HMRC failed.",
        detail: err instanceof Error ? err.message : "Unknown error",
      },
      { status: 503 }
    );
  }

  // Build HMRC request URL
  // Verified check (with consultation number): include requester VAT
  const hmrcUrl = requesterNormalised
    ? `${HMRC_VAT_URL}/${normalised}?requester=${requesterNormalised}`
    : `${HMRC_VAT_URL}/${normalised}`;

  try {
    const hmrcRes = await fetch(hmrcUrl, {
      headers: {
        Accept: "application/vnd.hmrc.2.0+json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (hmrcRes.status === 404) {
      return NextResponse.json(
        {
          valid: false,
          vat_number: raw,
          normalised,
          source: "hmrc",
        },
        { status: 200 }
      );
    }

    if (hmrcRes.status === 401) {
      // Token expired or invalid — clear cache and let caller retry
      cachedToken = null;
      return NextResponse.json(
        { error: "HMRC authentication failed. Please retry." },
        { status: 503 }
      );
    }

    if (!hmrcRes.ok) {
      const errText = await hmrcRes.text();
      return NextResponse.json(
        { error: "HMRC API error.", hmrc_status: hmrcRes.status, detail: errText },
        { status: 502 }
      );
    }

    const data = await hmrcRes.json();
    const target = data.target || {};
    const addr = target.address || null;

    return NextResponse.json(
      {
        valid: true,
        vat_number: raw,
        normalised,
        business_name: target.name || null,
        address: addr
          ? {
              line1: addr.line1 || null,
              line2: addr.line2 || null,
              line3: addr.line3 || null,
              postcode: addr.postCode || null,
              country_code: addr.countryCode || null,
            }
          : null,
        // Only present on verified (requester) checks
        consultation_number: data.consultationNumber || null,
        request_date: data.processingDate || null,
        verified_check: !!requesterNormalised,
        source: "hmrc_v2",
      },
      { status: 200 }
    );
  } catch (err: unknown) {
    return NextResponse.json(
      {
        error: "Failed to reach HMRC API.",
        detail: err instanceof Error ? err.message : "Unknown error",
      },
      { status: 502 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    {
      error: "Method not allowed.",
      hint: 'POST { "vat_number": "GB123456789" } — optionally include "requester_vat_number" for an auditable verified check with consultation number.',
    },
    { status: 405 }
  );
}
