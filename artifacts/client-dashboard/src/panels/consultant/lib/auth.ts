export interface AuthUser {
  id: string;
  name: string;
  title: string;
  email: string;
  role: "therapist" | "admin" | "client";
  avatarInitials: string;
  photoUrl?: string;
}

export const DEFAULT_THERAPIST: AuthUser = {
  id: "doc-1",
  name: "Dr. Evelyn Reed, PhD",
  title: "Licensed Clinical Psychologist",
  email: "dr.evelyn@hexpertify.com",
  role: "therapist",
  avatarInitials: "ER",
  photoUrl: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=400&q=80",
};

const STORAGE_KEY = "hexpertify_auth_user";

function checkSsoTransfer(): AuthUser | null {
  try {
    const params = new URLSearchParams(window.location.search);
    const ssoRaw = params.get("sso_user") || params.get("sso");
    if (ssoRaw) {
      let user: AuthUser;
      try {
        user = JSON.parse(decodeURIComponent(ssoRaw));
      } catch {
        user = DEFAULT_THERAPIST;
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
      const url = new URL(window.location.href);
      url.searchParams.delete("sso_user");
      url.searchParams.delete("sso");
      window.history.replaceState({}, document.title, url.pathname + url.search);
      return user;
    }
  } catch (e) {}
  return null;
}

export function getAuthUser(): AuthUser | null {
  try {
    const ssoUser = checkSsoTransfer();
    if (ssoUser) return ssoUser;
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return null;
    return JSON.parse(data);
  } catch (e) {
    return null;
  }
}

export function setAuthUser(user: AuthUser): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    window.dispatchEvent(new Event("auth_state_change"));
  } catch (e) {}
}

export function isAuthenticated(): boolean {
  try {
    if (checkSsoTransfer()) return true;
    const data = localStorage.getItem(STORAGE_KEY);
    return !!data;
  } catch (e) {
    return false;
  }
}

export function logoutUser(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
    window.dispatchEvent(new Event("auth_state_change"));
  } catch (e) {}
}

