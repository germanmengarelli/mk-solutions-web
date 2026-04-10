"use server";

import { auth } from "@/auth";
import { domoFetch } from "@/lib/api-client";
import { revalidatePath } from "next/cache";

export async function eliminarUsuarioAction(userId: number) {
  const session = await auth();
  if (!session) return { error: "Sesión expirada." };

  const token = (session as any)?.domo_token ?? "";

  try {
    const res = await domoFetch(`/api/usuarios/${userId}`, token, {
      method: "DELETE",
    });
    const data = await res.json();

    if (!res.ok) {
      return { error: data.error ?? "Error al eliminar usuario." };
    }

    revalidatePath("/crm/usuarios");
    return { message: data.message ?? "Usuario eliminado." };
  } catch {
    return { error: "Error de conexión con el servidor." };
  }
}

export async function toggleActivoAction(userId: number) {
  const session = await auth();
  if (!session) return { error: "Sesión expirada." };

  const token = (session as any)?.domo_token ?? "";

  try {
    const res = await domoFetch(`/api/usuarios/${userId}/toggle`, token, {
      method: "PUT",
    });
    const data = await res.json();

    if (!res.ok) {
      return { error: data.error ?? "Error al cambiar estado." };
    }

    revalidatePath("/crm/usuarios");
    return { message: `Usuario ${data.activo ? "activado" : "desactivado"}.` };
  } catch {
    return { error: "Error de conexión con el servidor." };
  }
}
