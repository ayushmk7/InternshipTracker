import { google } from "googleapis";

const SHEETS_ID = process.env.GOOGLE_SHEETS_ID;
const SHEET_NAME = process.env.GOOGLE_SHEET_NAME ?? "Applications";

function getAuth() {
  const json = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  if (!json) return null;
  try {
    const credentials = JSON.parse(json) as Record<string, unknown>;
    return new google.auth.GoogleAuth({
      credentials: credentials as object,
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });
  } catch {
    return null;
  }
}

export async function appendToSheet(row: {
  companyName?: string | null;
  roleTitle?: string | null;
  status: string;
  senderEmail: string;
  subject: string;
  receivedAt: string;
}): Promise<void> {
  if (!SHEETS_ID) return;

  const auth = getAuth();
  if (!auth) return;

  const sheets = google.sheets({ version: "v4", auth });
  await sheets.spreadsheets.values.append({
    spreadsheetId: SHEETS_ID,
    range: `${SHEET_NAME}!A:F`,
    valueInputOption: "USER_ENTERED",
    requestBody: {
      values: [
        [
          row.companyName ?? "",
          row.roleTitle ?? "",
          row.status,
          row.senderEmail,
          row.subject,
          row.receivedAt,
        ],
      ],
    },
  });
}
