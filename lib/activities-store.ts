import { domoGet, domoPost, getDomoToken } from "@/lib/api-client";

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

export async function listActivitiesByLeadIds(
  leadIds: string[]
): Promise<Record<string, Activity[]>> {
  if (!leadIds.length) return {};

  const token = await getDomoToken();
  const idsParam = leadIds.join(",");
  return domoGet<Record<string, Activity[]>>(
    `/api/crm/activities?lead_ids=${idsParam}`,
    token
  );
}

export async function createActivity(input: {
  lead_id: string;
  owner_user_id: string;
  tipo: string;
  detalle: string;
  resultado: string;
  next_step: string;
  next_date: string;
}) {
  const token = await getDomoToken();
  await domoPost("/api/crm/activities", token, input);
}
