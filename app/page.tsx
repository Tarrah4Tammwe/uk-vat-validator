export default function Home() {
  return (
    <main style={{ fontFamily: "monospace", maxWidth: 700, margin: "60px auto", padding: "0 20px" }}>
      <h1>🇬🇧 UK VAT Number Validator API</h1>
      <p>Validates UK VAT numbers in real-time against HMRC's official API. Returns business name, registered address, and consultation number.</p>

      <h2>Endpoint</h2>
      <pre style={{ background: "#f4f4f4", padding: 16, borderRadius: 6 }}>POST /api/validate</pre>

      <h2>Request</h2>
      <pre style={{ background: "#f4f4f4", padding: 16, borderRadius: 6 }}>{`{
  "vat_number": "GB123456789"
}`}</pre>

      <h2>Response (valid)</h2>
      <pre style={{ background: "#f4f4f4", padding: 16, borderRadius: 6 }}>{`{
  "valid": true,
  "vat_number": "GB123456789",
  "normalised": "123456789",
  "business_name": "EXAMPLE LTD",
  "address": {
    "line1": "1 Example Street",
    "postcode": "SW1A 1AA",
    "country_code": "GB"
  },
  "consultation_number": "ABC123456789",
  "request_date": "2026-06-11T10:00:00Z",
  "source": "hmrc"
}`}</pre>

      <h2>Response (invalid)</h2>
      <pre style={{ background: "#f4f4f4", padding: 16, borderRadius: 6 }}>{`{
  "valid": false,
  "vat_number": "GB000000000",
  "normalised": "000000000",
  "source": "hmrc"
}`}</pre>

      <p>
        <a href="https://rapidapi.com" target="_blank" rel="noopener noreferrer">Subscribe on RapidAPI</a>
        {" · "}
        <a href="/api/health">Health check</a>
      </p>
    </main>
  );
}
