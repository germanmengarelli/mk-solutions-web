import { domoGet, domoPost, domoPut, getDomoToken } from "@/lib/api-client";

export const CRM_STATUSES = [
  "Oportunidad",
  "Propuesta",
  "Facturado",
  "Cobrado",
  "Entregado",
] as const;

export type CrmStatus = (typeof CRM_STATUSES)[number];

export type CrmItem = {
  product: string;
  quantity: number;
  price: number;
  supplier: string;
  cost?: number | null;
  ivaRate?: number; // 21 | 10.5 — porcentaje de IVA del item
};

export type CrmCard = {
  code: string;
  status: CrmStatus;
  cliente: string;
  nombre: string;
  contacto: string;
  observaciones: string;
  items: CrmItem[];
  totalVenta: number;
  proveedores: string;
  responsable: string;
  createdAt: string;
  updatedAt: string;
  resultado: string;
  motivoRechazo: string;
  cobrado: boolean;
  oportunidadAt: string;
  propuestaAt: string;
  facturadoAt: string;
  cobradoAt: string;
  entregadoAt: string;
  entregaOk: boolean;
};

export type AuditLog = {
  timestamp: string;
  usuario: string;
  codigo: string;
  accion: string;
  antes: string;
  despues: string;
};

export type Perdida = {
  codigo: string;
  cliente: string;
  responsable: string;
  totalCotizado: number;
  motivo: string;
  fecha: string;
  usuario: string;
};

export async function listCrmCards(): Promise<CrmCard[]> {
  const token = await getDomoToken();
  return domoGet<CrmCard[]>("/api/crm/cards", token);
}

export async function listAuditLogs(): Promise<AuditLog[]> {
  const token = await getDomoToken();
  return domoGet<AuditLog[]>("/api/crm/audit-log", token);
}

export async function appendAuditLog(_entry: AuditLog) {
  // Audit logging is now handled server-side by the backend controller.
  // This function is kept for API compatibility but is a no-op.
}

export async function appendPerdida(entry: Perdida) {
  const token = await getDomoToken();
  await domoPost("/api/crm/perdidas", token, entry);
}

export async function createCrmCard(input: {
  cliente: string;
  nombre: string;
  contacto: string;
  observaciones: string;
  responsable: string;
}): Promise<string> {
  const token = await getDomoToken();
  const card = await domoPost<CrmCard>("/api/crm/cards", token, input);
  return card.code;
}

export async function updateCrmCard(
  code: string,
  patch: Partial<CrmCard>
): Promise<{ currentCard: CrmCard; nextCard: CrmCard }> {
  const token = await getDomoToken();
  return domoPut<{ currentCard: CrmCard; nextCard: CrmCard }>(
    `/api/crm/cards/${code}`,
    token,
    patch
  );
}

export function totalVentaFromItems(items: CrmItem[]) {
  return items.reduce((acc, item) => acc + item.quantity * item.price, 0);
}

export function proveedoresFromItems(items: CrmItem[]) {
  const set = new Set(
    items
      .map((item) => item.supplier)
      .map((supplier) => supplier.trim())
      .filter(Boolean)
  );
  return Array.from(set).join(", ");
}

export function formatIso(iso?: string) {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleString();
}
