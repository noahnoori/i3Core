i3Core website rebuild + anonymous internal feedback (AI-assisted)

Overview
- Static site (pages: index, about, capabilities, contract vehicles, contact).
- Internal-only anonymous feedback widget at /.internal/feedback.html.
- Serverless endpoints (api/) for receiving feedback and admin listing.
- Postgres is used to store anonymized feedback. Admin dashboard at /admin/dashboard.html.

Defaults and recommended deployment
- Frontend: Vercel (static)
- Serverless API: Vercel Serverless Functions (api/*.js)
- Database: Managed PostgreSQL (provide DATABASE_URL)

Environment variables
- DATABASE_URL=postgres://...
- OPENAI_API_KEY=sk-...
- ADMIN_TOKEN=choose-a-secret-token

DB schema (example)

CREATE TABLE feedback (
  id TEXT PRIMARY KEY,
  anon_id TEXT,
  text_redacted TEXT,
  summary TEXT,
  category TEXT,
  sentiment TEXT,
  created_at TIMESTAMP
);

Security & privacy notes
- The server attempts to redact emails, phone numbers, URLs, and simple name patterns before calling AI or writing to the DB.
- IPs and user-agent are not persisted. Admin access is protected by ADMIN_TOKEN; place behind internal network or VPC.
- Review anonymization logic and AI usage policy before production.

How to run locally
1. Install deps: npm install
2. Create a .env file with DATABASE_URL and ADMIN_TOKEN (and OPENAI_API_KEY if you want summaries).
3. Use Vercel CLI (vercel dev) or run with node for quick testing (serverless endpoints expect Vercel environment).

What's next (recommended)
- Harden anonymization (use a dedicated PII redaction service or custom NER model).
- Add authentication (SSO) and IP/VPN restriction so pages are internal-only.
- Add tests and monitoring for the API.
