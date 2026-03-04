# Internship Spreadsheet Agent

Track internship applications by forwarding company emails to an AgentMail inbox. Each email is classified (offered / OA / interviewing) via OpenAI and stored in Postgres. Optional sync to Google Sheets.

## Setup

1. **Clone and install**
   ```bash
   npm install
   ```

2. **Environment**
   - Copy `.env.example` to `.env.local`
   - Set `AGENTMAIL_API_KEY`, `OPENAI_API_KEY`, and `POSTGRES_URL`

3. **Database**
   - Add a Postgres database in [Vercel](https://vercel.com) (Storage → Postgres / Neon)
   - Run the SQL in `schema.sql` in the Neon SQL Editor

4. **Run locally**
   ```bash
   npm run dev
   ```

5. **AgentMail (after first deploy)**
   - Deploy to Vercel, then set `WEBHOOK_URL=https://<your-app>.vercel.app/api/webhook/agentmail`
   - Run: `npx tsx scripts/setup-agentmail.ts`
   - Forward internship emails to the printed inbox address

## Optional: Google Sheets

1. Create a Google Cloud project, enable Sheets API, create a service account, download JSON key
2. Share your sheet with the service account email (Editor)
3. Set `GOOGLE_SHEETS_ID` (from sheet URL) and `GOOGLE_SERVICE_ACCOUNT_JSON` (minified JSON string) in Vercel env

## Scripts

- `npm run dev` — local dev server
- `npm run build` — production build
- `npx tsx scripts/setup-agentmail.ts` — create inbox + webhook (run once, with `WEBHOOK_URL` and `AGENTMAIL_API_KEY` set)
