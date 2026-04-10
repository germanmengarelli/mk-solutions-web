"use server";

import { auth } from "@/auth";
import { domoFetch } from "@/lib/api-client";

export async function cambiarPasswordAction(formData: FormData) {
  const session = await auth();
  if (!session) return { error: "Sesión expirada. Volvé a iniciar sesión." };

  const token = (session as any)?.domo_token ?? "";
  const password_actual = String(formData.get("password_actual") ?? "").trim();
  const password_nuevo = String(formData.get("password_nuevo") ?? "").trim();

  if (!password_actual || !password_nuevo) {
    return { error: "Completá ambos campos." };
  }
  if (password_nuevo.length < 8) {
    return { error: "La nueva contraseña debe tener al menos 8 caracteres." };
  }

  try {
    const res = await domoFetch("/api/auth/cambiar-password", token, {
      method: "PUT",
      body: JSON.stringify({ password_actual, password_nuevo }),
    });

    const data = await res.json();

    if (!res.ok) {
      return { error: data.error ?? "Error al cambiar la contraseña." };
    }

    return { message: data.message ?? "Contraseña actualizada." };
  } catch {
    return { error: "Error de conexión con el servidor." };
  }
}
