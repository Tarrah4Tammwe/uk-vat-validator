export default function Home() {
  return (
    <main style={{ fontFamily: "monospace", maxWidth: 720, margin: "60px auto", padding: "0 20px" }}>
      <h1>🇬🇧 UK VAT Number Validator API</h1>
      <p>
        Real-time UK VAT validation against HMRC&apos;s official v2 API. Returns business name,
        registered address, and optional consultation number for audit trails.
        Handles all UK VAT formats including GB/XI prefix and branch trader numbers.

      </p>

      <h2>Endpoint</h2>
      <pre style={{ background: "#f4f4f4", padding: 16, borderRadius: 6 }}>POST /api/validate</pre>

      <h2>Request — basic check</h2>
      <pre style={{ background: "#f4f4f4", padding: 16, borderRadius: 6 }}>{`{
  "vat_number": "GB123456789"
}`}</pre>

      <h2>Request — verified check (with consultation number)</h2>
      <pre style={{ background: "#f4f4f4", padding: 16, borderRadius: 6 }}>{`{
  "vat_number": "GB123456789",
  "requester_vat_number": "GB987654321"
}`}</pre>

      <h2>Response (valid)</h2>
      <pre style={{ background: "#f4f4f4", padding: 16, borderRadius: 6 }}>{`{
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
}`}</pre>

      <h2>Response (invalid)</h2>
      <pre style={{ background: "#f4f4f4", padding: 16, borderRadius: 6 }}>{`{
  "valid": false,
  "vat_number": "GB000000000",
  "normalised": "000000000",
  "source": "hmrc"
}`}</pre>

      <h2>Accepted formats</h2>
      <pre style={{ background: "#f4f4f4", padding: 16, borderRadius: 6 }}>{`GB123456789      standard (GB prefix)
XI123456789      Northern Ireland (XI prefix)  
123456789        no prefix — also accepted
GB 123 456 789   spaces stripped automatically
123456789012     branch trader (12 digits)
GD123            government department
HA123            health authority`}</pre>

      <p>
        <a href="https://rapidapi.com" target="_blank" rel="noopener noreferrer">Subscribe on RapidAPI</a>
        {" · "}
        <a href="/api/health">Health check</a>
      </p>
    </main>
  );
}
