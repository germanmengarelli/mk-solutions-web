"use server";

import { auth } from "@/auth";
import { domoFetch } from "@/lib/api-client";
import { revalidatePath } from "next/cache";

export async function eliminarOrdenAction(code: string) {
  const session = await auth();
  if (!session) return { error: "Sesión expirada." };

  const token = (session as any)?.domo_token ?? "";

  try {
    const res = await domoFetch(`/api/crm/cards/${code}`, token, {
      method: "DELETE",
    });
    const data = await res.json();

    if (!res.ok) {
      return { error: data.error ?? "Error al eliminar la orden." };
    }

    revalidatePath("/crm/presupuestos");
    return { message: data.message ?? "Orden eliminada." };
  } catch {
    return { error: "Error de conexión con el servidor." };
  }
}
