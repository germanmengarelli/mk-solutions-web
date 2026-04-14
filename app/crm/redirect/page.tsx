import { redirect } from "next/navigation";
import { auth } from "@/auth";

export default async function CrmRedirectPage() {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  redirect("https://mksolutions-crm.vercel.app/login");
}
