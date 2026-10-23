import type { AuthUser } from "@/types";

export const isAdmin = (user: AuthUser | null) => user?.role === "ADMIN";
