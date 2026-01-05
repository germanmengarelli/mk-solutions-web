import { sheetsClient, SHEET_ID } from "@/lib/sheets";

function isActive(v: any) {
  const s = String(v ?? "").trim().toLowerCase();
  return s === "true" || s === "1" || s === "yes" || s === "si" || s === "sí";
}

export async function findUserByUsername(username: string) {
  const sheets = await sheetsClient();
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: "Users!A2:H",
  });

  const rows = (res.data.values ?? []) as string[][];
  const u = username.trim().toLowerCase();

  for (const r of rows) {
    const [user_id, name, email, uname, role, active, password_hash] = r;

    if (String(uname ?? "").trim().toLowerCase() === u && isActive(active)) {
      return {
        user_id: user_id ?? "",
        name: name ?? "",
        email: email ?? "",
        username: uname ?? "",
        role: role ?? "",
        active,
        password_hash: password_hash ?? "",
      };
    }
  }
  return null;
}

export type UserRow = {
  user_id: string;
  name: string;
  email: string;
  username: string;
  role: string;
  active: any;
};

export async function listUsers() {
  const sheets = await sheetsClient();
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: "Users!A2:H",
  });

  const rows = (res.data.values ?? []) as string[][];
  return rows
    .filter((r) => r.length >= 6)
    .map((r) => {
      const [user_id, name, email, username, role, active] = r;
      return {
        user_id: user_id ?? "",
        name: name ?? "",
        email: email ?? "",
        username: username ?? "",
        role: role ?? "",
        active,
      };
    })
    .filter((u) => u.user_id && u.username && isActive(u.active));
}
