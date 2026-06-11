import { NextResponse } from "next/server";

export async function GET() {
  const configured = !!(process.env.HMRC_CLIENT_ID && process.env.HMRC_CLIENT_SECRET);
  const environment = process.env.HMRC_ENVIRONMENT === "sandbox" ? "sandbox" : "production";
  return NextResponse.json({
    status: configured ? "ok" : "degraded",
    service: "UK VAT Number Validator API",
    version: "2.0.0",
    hmrc_api_version: "v2",
    hmrc_environment: environment,
    credentials_configured: configured,
    endpoints: [
      {
        method: "POST",
        path: "/api/validate",
        description: "Validate a UK VAT number via HMRC v2. Optionally include requester_vat_number for verified check with consultation number.",
      },
    ],
    timestamp: new Date().toISOString(),
  });
}
