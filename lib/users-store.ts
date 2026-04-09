import { domoGet, getDomoToken } from "@/lib/api-client";

export type UserRow = {
  user_id: string;
  name: string;
  email: string;
  username: string;
  role: string;
  active: any;
};

/**
 * Find user by username — used by auth. Since auth now goes through
 * the DOMO backend directly (domoLogin), this is only kept for
 * backward compatibility. Returns null (auth.ts no longer calls this).
 */
export async function findUserByUsername(
  _username: string
): Promise<null> {
  return null;
}

/**
 * List active users from the DOMO backend.
 */
export async function listUsers(): Promise<UserRow[]> {
  const token = await getDomoToken();
  const raw = await domoGet<any[]>("/api/usuarios", token);

  return raw
    .filter((u: any) => u.activo !== false)
    .map((u: any) => ({
      user_id: String(u.id),
      name: u.nombre ?? "",
      email: u.email ?? "",
      username: u.email ?? "",
      role: u.rol ?? "",
      active: u.activo ?? true,
    }));
}
