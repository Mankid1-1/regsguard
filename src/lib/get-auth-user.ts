import { getDbUser } from "@/lib/auth";

export interface AuthUser {
  id: string;
  email: string;
  name: string | null;
  role: "USER" | "ADMIN" | "OWNER" | "MANAGER" | "FIELD_WORKER" | "BOOKKEEPER";
  onboardingComplete: boolean;
}

/**
 * Get the authenticated user from Clerk session.
 * Returns null if not authenticated.
 */
export async function getAuthUser(): Promise<AuthUser | null> {
  const user = await getDbUser();
  if (!user) return null;

  return {
    id: user.id,
    email: user.email,
    name: user.name ?? null,
    role: user.role,
    onboardingComplete: user.onboardingComplete,
  };
}
