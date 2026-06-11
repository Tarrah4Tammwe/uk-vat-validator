import { NextRequest, NextResponse } from "next/server";

function normaliseVat(raw: string): string {
  // Strip whitespace, dashes, dots
  let vat = raw.toUpperCase().replace(/[\s\-\.]/g, "");
  // Strip leading GB or XI prefix for HMRC call (API expects digits only, 9 chars)
  if (vat.startsWith("GB") || vat.startsWith("XI")) {
    vat = vat.slice(2);
  }
  return vat;
}

function isValidFormat(vat: string): boolean {
  // Standard UK VAT: 9 digits
  // Branch trader: 12 digits
  // Government depts: GD + 3 digits
  // Health authorities: HA + 3 digits
  return /^\d{9}$/.test(vat) || /^\d{12}$/.test(vat) || /^GD\d{3}$/.test(vat) || /^HA\d{3}$/.test(vat);
}

export async function POST(req: NextRequest) {
  let body: { vat_number?: string };
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

  if (!isValidFormat(normalised)) {
    return NextResponse.json({
      valid: false,
      vat_number: raw,
      normalised,
      error: "VAT number format is invalid. Expected 9 digits (standard UK), 12 digits (branch trader), GD + 3 digits (government), or HA + 3 digits (health authority).",
      source: "format_check",
    }, { status: 200 });
  }

  try {
    const hmrcRes = await fetch(
      `https://api.service.hmrc.gov.uk/organisations/vat/check-vat-number/lookup/${normalised}`,
      {
        method: "GET",
        headers: { Accept: "application/json" },
      }
    );

    if (hmrcRes.status === 404) {
      return NextResponse.json({
        valid: false,
        vat_number: raw,
        normalised,
        source: "hmrc",
      }, { status: 200 });
    }

    if (!hmrcRes.ok) {
      const errText = await hmrcRes.text();
      return NextResponse.json({
        error: "HMRC API error.",
        hmrc_status: hmrcRes.status,
        detail: errText,
      }, { status: 502 });
    }

    const data = await hmrcRes.json();
    const target = data.target || {};

    return NextResponse.json({
      valid: true,
      vat_number: raw,
      normalised,
      business_name: target.name || null,
      address: target.address
        ? {
            line1: target.address.line1 || null,
            line2: target.address.line2 || null,
            line3: target.address.line3 || null,
            postcode: target.address.postCode || null,
            country_code: target.address.countryCode || null,
          }
        : null,
      consultation_number: data.consultationNumber || null,
      request_date: data.processingDate || null,
      source: "hmrc",
    }, { status: 200 });
  } catch (err: unknown) {
    return NextResponse.json({
      error: "Failed to reach HMRC API.",
      detail: err instanceof Error ? err.message : "Unknown error",
    }, { status: 502 });
  }
}

export async function GET() {
  return NextResponse.json(
    { error: "Use POST with { \"vat_number\": \"GB123456789\" }" },
    { status: 405 }
  );
}
