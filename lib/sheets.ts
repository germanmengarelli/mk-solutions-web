import { google } from "googleapis";

function getAuth() {
  const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL!;
  const privateKey = process.env.GOOGLE_PRIVATE_KEY!.replace(/\\n/g, "\n");

  return new google.auth.JWT({
    email: clientEmail,
    key: privateKey,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
}

export async function sheetsClient() {
  const auth = getAuth();
  return google.sheets({ version: "v4", auth });
}

export const SHEET_ID = process.env.GOOGLE_SHEETS_ID!;

// ✅ NUEVO: appendRow para agregar filas en una pestaña
export async function appendRow(
  sheetName: string,
  row: (string | number | boolean | null | undefined)[]
) {
  const sheets = await sheetsClient();

  // Google Sheets espera booleans como TRUE/FALSE o boolean, ambos funcionan.
  // Normalizamos null/undefined a string vacía.
  const values = row.map((v) => (v === null || v === undefined ? "" : v));

  await sheets.spreadsheets.values.append({
    spreadsheetId: SHEET_ID,
    range: `${sheetName}!A1`,
    valueInputOption: "USER_ENTERED",
    insertDataOption: "INSERT_ROWS",
    requestBody: {
      values: [values],
    },
  });
}
