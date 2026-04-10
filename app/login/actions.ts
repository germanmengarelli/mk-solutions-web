"use server";

import { signIn } from "@/auth";
import { AuthError } from "next-auth";

export async function loginAction(formData: FormData) {
  try {
    await signIn("credentials", {
      username: formData.get("email") as string,
      password: formData.get("password") as string,
      redirectTo: (formData.get("next") as string) || "/crm",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "Usuario o contraseña incorrectos." };
    }
    // NEXT_REDIRECT throws an error that must be re-thrown
    throw error;
  }
}
