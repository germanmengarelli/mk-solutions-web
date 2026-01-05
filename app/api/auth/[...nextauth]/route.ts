import { handlers } from "@/auth";

export const runtime = "nodejs"; // 👈 importante
export const { GET, POST } = handlers;
