import { domoGet, domoPost, domoPut, getDomoToken } from "@/lib/api-client";

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
};

// Map DOMO leads API response to the Lead type expected by the frontend
function mapDomoLead(raw: any): Lead {
  return {
    lead_id: String(raw.id ?? raw.lead_id ?? ""),
    created_at: raw.created_at ?? raw.creado_en ?? "",
    owner_user_id: String(raw.usuario_id ?? raw.owner_user_id ?? ""),
    empresa: raw.empresa ?? raw.nombre ?? "",
    contacto: raw.contacto ?? "",
    email: raw.email ?? "",
    telefono: raw.telefono ?? "",
    estado: raw.estado ?? "nuevo",
    origen: raw.origen ?? "",
    notas: raw.notas ?? raw.observaciones ?? "",
  };
}

export async function listLeads(params: {
  role: string;
  user_id: string;
}): Promise<Lead[]> {
  const token = await getDomoToken();
  // DOMO backend already handles role-based filtering via auth middleware
  const raw = await domoGet<any>("/api/leads", token);
  // The response may be { items: [...] } (paginated) or an array
  const items = Array.isArray(raw) ? raw : raw.items ?? [];
  return items.map(mapDomoLead);
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
  const token = await getDomoToken();
  await domoPost("/api/leads", token, {
    nombre: input.empresa,
    contacto: input.contacto,
    email: input.email,
    telefono: input.telefono,
    estado: input.estado || "nuevo",
    origen: input.origen,
    observaciones: input.notas,
  });
}

export async function updateLead(lead_id: string, patch: Partial<Lead>) {
  const token = await getDomoToken();
  const body: any = {};
  if (patch.empresa !== undefined) body.nombre = patch.empresa;
  if (patch.contacto !== undefined) body.contacto = patch.contacto;
  if (patch.email !== undefined) body.email = patch.email;
  if (patch.telefono !== undefined) body.telefono = patch.telefono;
  if (patch.estado !== undefined) body.estado = patch.estado;
  if (patch.origen !== undefined) body.origen = patch.origen;
  if (patch.notas !== undefined) body.observaciones = patch.notas;
  if (patch.owner_user_id !== undefined) body.usuario_id = patch.owner_user_id;

  await domoPut(`/api/leads/${lead_id}`, token, body);
}
