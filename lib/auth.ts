const AUTH_KEY = "aura-user";

export interface AuthUser {
  email: string;
  isAdmin: boolean;
}

export function setAuth(email: string, isAdmin: boolean) {
  if (typeof window === "undefined") return;
  localStorage.setItem(AUTH_KEY, JSON.stringify({ email, isAdmin }));
}

export function getAuth(): AuthUser | null {
  if (typeof window === "undefined") return null;
  try {
    const data = localStorage.getItem(AUTH_KEY);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
}

export function isAdmin(): boolean {
  const auth = getAuth();
  return auth?.isAdmin ?? false;
}

export function logout() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(AUTH_KEY);
}
