import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    status: "ok",
    service: "UK VAT Number Validator API",
    version: "1.0.0",
    endpoints: [
      { method: "POST", path: "/api/validate", description: "Validate a UK VAT number via HMRC" },
    ],
    timestamp: new Date().toISOString(),
  });
}
