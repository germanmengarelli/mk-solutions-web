import { sheetsClient, SHEET_ID } from "@/lib/sheets";

export type Activity = {
  activity_id: string;
  created_at: string;
  lead_id: string;
  owner_user_id: string;
  tipo: string;
  detalle: string;
  resultado: string;
  next_step: string;
  next_date: string;
};

function nowIso() {
  return new Date().toISOString();
}

function makeActivityId() {
  return `ACT-${Date.now()}`;
}

export async function listActivitiesByLeadIds(leadIds: string[]) {
  if (!leadIds.length) return {};

  const leadSet = new Set(leadIds);
  const sheets = await sheetsClient();

  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: "Activities!A2:I",
  });

  const rows = (res.data.values ?? []) as string[][];

  const all: Activity[] = rows
    .filter((r) => r.length >= 3)
    .map((r) => {
      const [
        activity_id,
        created_at,
        lead_id,
        owner_user_id,
        tipo,
        detalle,
        resultado,
        next_step,
        next_date,
      ] = r;

      return {
        activity_id: activity_id ?? "",
        created_at: created_at ?? "",
        lead_id: lead_id ?? "",
        owner_user_id: owner_user_id ?? "",
        tipo: tipo ?? "",
        detalle: detalle ?? "",
        resultado: resultado ?? "",
        next_step: next_step ?? "",
        next_date: next_date ?? "",
      };
    })
    .filter((a) => leadSet.has(a.lead_id));

  // Agrupar por lead_id
  const grouped: Record<string, Activity[]> = {};
  for (const a of all) {
    grouped[a.lead_id] = grouped[a.lead_id] ?? [];
    grouped[a.lead_id].push(a);
  }

  // Ordenar por fecha (más nuevo arriba)
  for (const k of Object.keys(grouped)) {
    grouped[k].sort((a, b) => (b.created_at || "").localeCompare(a.created_at || ""));
  }

  return grouped;
}

export async function createActivity(input: {
  lead_id: string;
  owner_user_id: string;
  tipo: string;
  detalle: string;
  resultado: string;
  next_step: string;
  next_date: string; // YYYY-MM-DD
}) {
  const sheets = await sheetsClient();

  const row = [
    makeActivityId(),
    nowIso(),
    input.lead_id,
    input.owner_user_id,
    input.tipo,
    input.detalle,
    input.resultado,
    input.next_step,
    input.next_date,
  ];

  await sheets.spreadsheets.values.append({
    spreadsheetId: SHEET_ID,
    range: "Activities!A:I",
    valueInputOption: "RAW",
    requestBody: { values: [row] },
  });
}
