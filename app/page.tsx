export default function Home() {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        body {
          background: #0A0F1E;
          color: #E2E8F0;
          font-family: 'Inter', system-ui, sans-serif;
          font-size: 15px;
          line-height: 1.6;
          -webkit-font-smoothing: antialiased;
        }

        .page { max-width: 860px; margin: 0 auto; padding: 60px 24px 100px; }

        /* Header */
        .header { margin-bottom: 56px; }
        .badge {
          display: inline-flex; align-items: center; gap: 6px;
          background: rgba(37,99,235,0.15); border: 1px solid rgba(37,99,235,0.35);
          color: #60A5FA; font-size: 12px; font-weight: 600; letter-spacing: 0.06em;
          text-transform: uppercase; padding: 4px 10px; border-radius: 20px;
          margin-bottom: 20px;
        }
        .badge-dot {
          width: 6px; height: 6px; border-radius: 50%; background: #22C55E;
          box-shadow: 0 0 6px #22C55E;
          animation: pulse 2s infinite;
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
        h1 {
          font-size: clamp(28px, 5vw, 42px); font-weight: 700;
          color: #F8FAFC; letter-spacing: -0.02em; line-height: 1.15;
          margin-bottom: 16px;
        }
        h1 span { color: #2563EB; }
        .subtitle {
          font-size: 16px; color: #94A3B8; max-width: 560px; line-height: 1.7;
        }

        /* Meta row */
        .meta {
          display: flex; flex-wrap: wrap; gap: 24px;
          margin-top: 28px; padding-top: 28px;
          border-top: 1px solid rgba(255,255,255,0.06);
        }
        .meta-item { display: flex; flex-direction: column; gap: 3px; }
        .meta-label { font-size: 11px; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; color: #475569; }
        .meta-value { font-size: 14px; font-weight: 500; color: #CBD5E1; }

        /* Section */
        .section { margin-bottom: 48px; }
        h2 {
          font-size: 13px; font-weight: 700; letter-spacing: 0.1em;
          text-transform: uppercase; color: #475569;
          margin-bottom: 16px;
        }

        /* Endpoint pill */
        .endpoint {
          display: inline-flex; align-items: center; gap: 10px;
          background: rgba(37,99,235,0.1); border: 1px solid rgba(37,99,235,0.25);
          border-radius: 8px; padding: 10px 16px;
        }
        .method {
          font-family: 'JetBrains Mono', monospace; font-size: 12px; font-weight: 500;
          color: #fff; background: #2563EB; padding: 2px 8px; border-radius: 4px;
          letter-spacing: 0.04em;
        }
        .path {
          font-family: 'JetBrains Mono', monospace; font-size: 14px; color: #E2E8F0;
        }

        /* Code blocks */
        .code-card {
          background: #111827; border: 1px solid rgba(255,255,255,0.07);
          border-radius: 10px; overflow: hidden;
        }
        .code-card-header {
          display: flex; align-items: center; justify-content: space-between;
          padding: 10px 16px; border-bottom: 1px solid rgba(255,255,255,0.06);
          background: rgba(255,255,255,0.02);
        }
        .code-lang {
          font-size: 11px; font-weight: 600; letter-spacing: 0.08em;
          text-transform: uppercase; color: #475569;
        }
        .code-tag {
          font-size: 11px; font-weight: 500; color: #22C55E;
          background: rgba(34,197,94,0.1); padding: 2px 8px; border-radius: 10px;
        }
        .code-tag.optional { color: #94A3B8; background: rgba(148,163,184,0.1); }
        pre {
          font-family: 'JetBrains Mono', monospace !important;
          font-size: 13px !important; line-height: 1.7;
          padding: 20px !important; overflow-x: auto;
          background: transparent !important;
          color: #CBD5E1;
        }
        .key { color: #7DD3FC; }
        .str { color: #86EFAC; }
        .bool-true { color: #4ADE80; }
        .bool-null { color: #F87171; }
        .num { color: #FCD34D; }

        /* Format table */
        .format-table { width: 100%; border-collapse: collapse; }
        .format-table th {
          font-size: 11px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase;
          color: #475569; padding: 8px 12px; text-align: left;
          border-bottom: 1px solid rgba(255,255,255,0.07);
        }
        .format-table td {
          padding: 10px 12px; border-bottom: 1px solid rgba(255,255,255,0.04);
          font-size: 13px; color: #CBD5E1;
        }
        .format-table tr:last-child td { border-bottom: none; }
        .format-table td:first-child {
          font-family: 'JetBrains Mono', monospace; color: #7DD3FC;
        }
        .format-table td:last-child { color: #64748B; font-size: 12px; }

        /* Links */
        .footer-links { display: flex; gap: 16px; flex-wrap: wrap; margin-top: 48px; }
        .btn {
          display: inline-flex; align-items: center; gap: 8px;
          padding: 10px 20px; border-radius: 8px; font-size: 14px; font-weight: 600;
          text-decoration: none; transition: all 0.15s;
        }
        .btn-primary {
          background: #2563EB; color: #fff;
        }
        .btn-primary:hover { background: #1D4ED8; }
        .btn-ghost {
          background: rgba(255,255,255,0.05); color: #94A3B8;
          border: 1px solid rgba(255,255,255,0.1);
        }
        .btn-ghost:hover { background: rgba(255,255,255,0.08); color: #E2E8F0; }

        @media (max-width: 600px) {
          .page { padding: 40px 16px 80px; }
          h1 { font-size: 26px; }
        }
      `}</style>

      <div className="page">
        {/* Header */}
        <header className="header">
          <div className="badge">
            <span className="badge-dot"></span>
            Live · HMRC v2
          </div>
          <h1>UK <span>VAT</span> Number<br />Validator API</h1>
          <p className="subtitle">
            Real-time validation against HMRC&apos;s official v2 API. Returns business name,
            registered address, and government-issued consultation numbers for audit trails.
          </p>
          <div className="meta">
            <div className="meta-item">
              <span className="meta-label">Source</span>
              <span className="meta-value">HMRC Official API</span>
            </div>
            <div className="meta-item">
              <span className="meta-label">Auth</span>
              <span className="meta-value">OAuth 2.0 Bearer</span>
            </div>
            <div className="meta-item">
              <span className="meta-label">Coverage</span>
              <span className="meta-value">UK + Northern Ireland</span>
            </div>
            <div className="meta-item">
              <span className="meta-label">Response</span>
              <span className="meta-value">JSON · &lt;300ms</span>
            </div>
          </div>
        </header>

        {/* Endpoint */}
        <section className="section">
          <h2>Endpoint</h2>
          <div className="endpoint">
            <span className="method">POST</span>
            <span className="path">/api/validate</span>
          </div>
        </section>

        {/* Request — basic */}
        <section className="section">
          <h2>Request</h2>
          <div className="code-card">
            <div className="code-card-header">
              <span className="code-lang">JSON</span>
              <span className="code-tag">Basic check</span>
            </div>
            <pre>{`{
  `}<span className="key">&quot;vat_number&quot;</span>{`: `}<span className="str">&quot;GB123456789&quot;</span>{`
}`}</pre>
          </div>
        </section>

        {/* Request — verified */}
        <section className="section">
          <div className="code-card">
            <div className="code-card-header">
              <span className="code-lang">JSON</span>
              <span className="code-tag optional">Verified check · returns consultation number</span>
            </div>
            <pre>{`{
  `}<span className="key">&quot;vat_number&quot;</span>{`: `}<span className="str">&quot;GB123456789&quot;</span>{`,
  `}<span className="key">&quot;requester_vat_number&quot;</span>{`: `}<span className="str">&quot;GB987654321&quot;</span>{`
}`}</pre>
          </div>
        </section>

        {/* Response valid */}
        <section className="section">
          <h2>Response · Valid</h2>
          <div className="code-card">
            <div className="code-card-header">
              <span className="code-lang">JSON</span>
              <span className="code-tag">200 OK</span>
            </div>
            <pre>{`{
  `}<span className="key">&quot;valid&quot;</span>{`: `}<span className="bool-true">true</span>{`,
  `}<span className="key">&quot;vat_number&quot;</span>{`: `}<span className="str">&quot;GB123456789&quot;</span>{`,
  `}<span className="key">&quot;normalised&quot;</span>{`: `}<span className="str">&quot;123456789&quot;</span>{`,
  `}<span className="key">&quot;business_name&quot;</span>{`: `}<span className="str">&quot;EXAMPLE LTD&quot;</span>{`,
  `}<span className="key">&quot;address&quot;</span>{`: {
    `}<span className="key">&quot;line1&quot;</span>{`: `}<span className="str">&quot;1 Example Street&quot;</span>{`,
    `}<span className="key">&quot;postcode&quot;</span>{`: `}<span className="str">&quot;SW1A 1AA&quot;</span>{`,
    `}<span className="key">&quot;country_code&quot;</span>{`: `}<span className="str">&quot;GB&quot;</span>{`
  },
  `}<span className="key">&quot;consultation_number&quot;</span>{`: `}<span className="str">&quot;ABC123456789&quot;</span>{`,
  `}<span className="key">&quot;request_date&quot;</span>{`: `}<span className="str">&quot;2026-06-11T10:00:00Z&quot;</span>{`,
  `}<span className="key">&quot;verified_check&quot;</span>{`: `}<span className="bool-true">true</span>{`,
  `}<span className="key">&quot;source&quot;</span>{`: `}<span className="str">&quot;hmrc_v2&quot;</span>{`
}`}</pre>
          </div>
        </section>

        {/* Response invalid */}
        <section className="section">
          <h2>Response · Invalid</h2>
          <div className="code-card">
            <div className="code-card-header">
              <span className="code-lang">JSON</span>
              <span className="code-tag optional">200 OK · not registered</span>
            </div>
            <pre>{`{
  `}<span className="key">&quot;valid&quot;</span>{`: `}<span className="bool-null">false</span>{`,
  `}<span className="key">&quot;vat_number&quot;</span>{`: `}<span className="str">&quot;GB000000000&quot;</span>{`,
  `}<span className="key">&quot;normalised&quot;</span>{`: `}<span className="str">&quot;000000000&quot;</span>{`,
  `}<span className="key">&quot;source&quot;</span>{`: `}<span className="str">&quot;hmrc&quot;</span>{`
}`}</pre>
          </div>
        </section>

        {/* Accepted formats */}
        <section className="section">
          <h2>Accepted formats</h2>
          <div className="code-card">
            <table className="format-table">
              <thead>
                <tr>
                  <th>Input</th>
                  <th>Type</th>
                  <th>Notes</th>
                </tr>
              </thead>
              <tbody>
                <tr><td>GB123456789</td><td>Standard</td><td>GB prefix included</td></tr>
                <tr><td>XI123456789</td><td>Northern Ireland</td><td>XI prefix accepted</td></tr>
                <tr><td>123456789</td><td>Standard</td><td>No prefix — also valid</td></tr>
                <tr><td>GB 123 456 789</td><td>Standard</td><td>Spaces stripped automatically</td></tr>
                <tr><td>123456789012</td><td>Branch trader</td><td>12 digits</td></tr>
                <tr><td>GD123</td><td>Government dept</td><td>GD + 3 digits</td></tr>
                <tr><td>HA123</td><td>Health authority</td><td>HA + 3 digits</td></tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Footer links */}
        <div className="footer-links">
          <a className="btn btn-primary" href="https://rapidapi.com/tarrah4tammwe/api/uk-vat-number-validator" target="_blank" rel="noopener noreferrer">
            Subscribe on RapidAPI
          </a>
          <a className="btn btn-ghost" href="/api/health">
            Health check
          </a>
        </div>
      </div>
    </>
  );
}
