/**
 * API client for communicating with the DOMO/MK Solutions Express backend.
 * Used server-side only (server components, server actions, auth callbacks).
 */

const DOMO_API_URL = process.env.DOMO_API_URL || "http://localhost:3000";

export interface DomoUsuario {
  id: number;
  nombre: string;
  email: string;
  rol: string;
  telefono: string;
  permisos: string[];
  cliente_id: number | null;
  primer_login: boolean;
}

export interface DomoLoginResponse {
  token: string;
  usuario: DomoUsuario;
}

/**
 * Authenticate against the DOMO backend.
 * Returns user data + access token, or null on failure.
 */
export async function domoLogin(
  email: string,
  password: string
): Promise<DomoLoginResponse | null> {
  try {
    const res = await fetch(`${DOMO_API_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (!res.ok) return null;

    const data = (await res.json()) as DomoLoginResponse;
    return data;
  } catch {
    return null;
  }
}

/**
 * Server-side fetch wrapper that adds the DOMO JWT token.
 * Use in server components and server actions to call backend endpoints.
 */
export async function domoFetch(
  path: string,
  token: string,
  options: RequestInit = {}
): Promise<Response> {
  const url = `${DOMO_API_URL}${path}`;

  return fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  });
}

/**
 * Convenience: fetch JSON from DOMO backend.
 */
export async function domoGet<T>(path: string, token: string): Promise<T> {
  const res = await domoFetch(path, token);
  if (!res.ok) {
    throw new Error(`DOMO API error ${res.status}: ${path}`);
  }
  return res.json() as Promise<T>;
}

/**
 * Convenience: POST JSON to DOMO backend.
 */
export async function domoPost<T>(
  path: string,
  token: string,
  body: unknown
): Promise<T> {
  const res = await domoFetch(path, token, {
    method: "POST",
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`DOMO API error ${res.status}: ${path} — ${text}`);
  }
  return res.json() as Promise<T>;
}

/**
 * Convenience: PUT JSON to DOMO backend.
 */
export async function domoPut<T>(
  path: string,
  token: string,
  body: unknown
): Promise<T> {
  const res = await domoFetch(path, token, {
    method: "PUT",
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`DOMO API error ${res.status}: ${path} — ${text}`);
  }
  return res.json() as Promise<T>;
}

/**
 * Get the DOMO token from the current NextAuth session (server-side only).
 */
export async function getDomoToken(): Promise<string> {
  const { auth } = await import("@/auth");
  const session = await auth();
  const token = (session as any)?.domo_token ?? "";
  if (!token) throw new Error("No DOMO token in session");
  return token;
}
