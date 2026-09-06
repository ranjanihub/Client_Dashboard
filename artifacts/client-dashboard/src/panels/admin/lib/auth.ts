export interface AdminAuthUser {
  id: string;
  name: string;
  email: string;
  role: "super_admin" | "admin";
  avatarUrl?: string;
}

export const DEFAULT_ADMIN: AdminAuthUser = {
  id: "admin-1",
  name: "Super Administrator",
  email: "admin@example.com",
  role: "super_admin",
  avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100",
};

const STORAGE_KEY = "hexpertify_admin_auth";

function checkSsoTransfer(): AdminAuthUser | null {
  try {
    const params = new URLSearchParams(window.location.search);
    const ssoRaw = params.get("sso_user") || params.get("sso");
    if (ssoRaw) {
      let user: AdminAuthUser;
      try {
        user = JSON.parse(decodeURIComponent(ssoRaw));
      } catch {
        user = DEFAULT_ADMIN;
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
      // Clean query parameter from URL without reloading
      const url = new URL(window.location.href);
      url.searchParams.delete("sso_user");
      url.searchParams.delete("sso");
      window.history.replaceState({}, document.title, url.pathname + url.search);
      return user;
    }
  } catch (e) {}
  return null;
}

export function getAdminAuth(): AdminAuthUser | null {
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

export function setAdminAuth(user: AdminAuthUser): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    window.dispatchEvent(new Event("auth_state_change"));
  } catch (e) {}
}

export function isAdminAuthenticated(): boolean {
  try {
    if (checkSsoTransfer()) return true;
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data || data === 'logged_out') return false;
    const parsed = JSON.parse(data);
    return parsed?.role === 'super_admin' || parsed?.role === 'admin';
  } catch (e) {
    return false;
  }
}

export function logoutAdmin(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
    window.dispatchEvent(new Event("auth_state_change"));
  } catch (e) {}
}

