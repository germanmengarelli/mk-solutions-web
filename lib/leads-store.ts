import { sheetsClient, SHEET_ID } from "@/lib/sheets";

export type Lead = {
  lead_id: string;
  created_at: string;
  owner_user_id: string;
  empresa: string;
  contacto: string;
  email: string;
  telefono: string;
  estado: string;
  origen: string;
  notas: string;
  rowNumber?: number; // fila real en Sheets
};

function nowIso() {
  return new Date().toISOString();
}

function makeLeadId() {
  return `LEAD-${Date.now()}`;
}

export async function listLeads(params: { role: string; user_id: string }) {
  const sheets = await sheetsClient();

  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: "Leads!A2:J",
  });

  const rows = (res.data.values ?? []) as string[][];

  const leads: Lead[] = rows
    .filter((r) => r.length >= 1)
    .map((r, idx) => {
      const [
        lead_id,
        created_at,
        owner_user_id,
        empresa,
        contacto,
        email,
        telefono,
        estado,
        origen,
        notas,
      ] = r;

      return {
        lead_id: lead_id ?? "",
        created_at: created_at ?? "",
        owner_user_id: owner_user_id ?? "",
        empresa: empresa ?? "",
        contacto: contacto ?? "",
        email: email ?? "",
        telefono: telefono ?? "",
        estado: estado ?? "Nuevo",
        origen: origen ?? "",
        notas: notas ?? "",
        rowNumber: idx + 2, // empieza en fila 2
      };
    });

  if (params.role === "admin") return leads;
  return leads.filter((l) => String(l.owner_user_id) === String(params.user_id));
}

export async function createLead(input: {
  owner_user_id: string;
  empresa: string;
  contacto: string;
  email: string;
  telefono: string;
  estado: string;
  origen: string;
  notas: string;
}) {
  const sheets = await sheetsClient();

  const row = [
    makeLeadId(),
    nowIso(),
    input.owner_user_id,
    input.empresa,
    input.contacto,
    input.email,
    input.telefono,
    input.estado,
    input.origen,
    input.notas,
  ];

  await sheets.spreadsheets.values.append({
    spreadsheetId: SHEET_ID,
    range: "Leads!A:J",
    valueInputOption: "RAW",
    requestBody: { values: [row] },
  });
}

export async function updateLead(lead_id: string, patch: Partial<Lead>) {
  const sheets = await sheetsClient();

  // 1) Traigo todo para encontrar la fila
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: "Leads!A2:J",
  });
  const rows = (res.data.values ?? []) as string[][];

  let foundIdx = -1;
  for (let i = 0; i < rows.length; i++) {
    if (String(rows[i][0] ?? "") === lead_id) {
      foundIdx = i;
      break;
    }
  }
  if (foundIdx === -1) throw new Error("Lead no encontrado");

  const rowNumber = foundIdx + 2;
  const current = rows[foundIdx] ?? [];

  const currentLead: Lead = {
    lead_id: current[0] ?? "",
    created_at: current[1] ?? "",
    owner_user_id: current[2] ?? "",
    empresa: current[3] ?? "",
    contacto: current[4] ?? "",
    email: current[5] ?? "",
    telefono: current[6] ?? "",
    estado: current[7] ?? "Nuevo",
    origen: current[8] ?? "",
    notas: current[9] ?? "",
  };

  const nextLead: Lead = { ...currentLead, ...patch };

  const nextRow = [
    nextLead.lead_id,
    nextLead.created_at,
    nextLead.owner_user_id,
    nextLead.empresa,
    nextLead.contacto,
    nextLead.email,
    nextLead.telefono,
    nextLead.estado,
    nextLead.origen,
    nextLead.notas,
  ];

  await sheets.spreadsheets.values.update({
    spreadsheetId: SHEET_ID,
    range: `Leads!A${rowNumber}:J${rowNumber}`,
    valueInputOption: "RAW",
    requestBody: { values: [nextRow] },
  });
}
