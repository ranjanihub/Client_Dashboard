export interface ClientAuthUser {
  id: string;
  name: string;
  email: string;
  role: "client" | "therapist" | "admin";
  avatarUrl?: string;
  phone?: string;
  age?: number | string;
  gender?: string;
  preferredLanguage?: string;
  assignedTherapistId?: string;
  assignedTherapistName?: string;
  assignedTherapistPhoto?: string;
  firstConsultationCompleted?: boolean;
}

export interface ConsultantAuthUser {
  id: string;
  name: string;
  title?: string;
  email: string;
  role: "therapist";
  avatarInitials?: string;
  photoUrl?: string;
}

export interface AdminAuthUser {
  id: string;
  name: string;
  email: string;
  role: "super_admin" | "admin";
  avatarUrl?: string;
}

export const DEFAULT_CLIENT: ClientAuthUser = {
  id: "client-1",
  name: "Sarah Jenkins",
  email: "sarah.jenkins@example.com",
  role: "client",
  avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
};

export const DEFAULT_CONSULTANT: ConsultantAuthUser = {
  id: "doc-1",
  name: "Dr. Evelyn Reed, PhD",
  title: "Licensed Clinical Psychologist",
  email: "dr.evelyn@hexpertify.com",
  role: "therapist",
  avatarInitials: "ER",
  photoUrl: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=400&q=80",
};

export const DEFAULT_ADMIN: AdminAuthUser = {
  id: "admin-1",
  name: "Super Administrator",
  email: "admin@example.com",
  role: "super_admin",
  avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100",
};

const CLIENT_STORAGE_KEY = "hexpertify_client_auth";
const CONSULTANT_STORAGE_KEY = "hexpertify_auth_user";
const ADMIN_STORAGE_KEY = "hexpertify_admin_auth";

function checkSsoTransfer(): any | null {
  try {
    const params = new URLSearchParams(window.location.search);
    const ssoTicket = params.get("sso_ticket");
    let ssoRaw = params.get("sso_user") || params.get("sso");

    // 1. Verify signed cryptographic SSO ticket if present
    if (ssoTicket) {
      const endpoints = ["/api/auth/sso-verify", "http://localhost:5000/api/auth/sso-verify", "http://localhost:3000/api/auth/sso-verify"];
      for (const ep of endpoints) {
        fetch(ep, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ticket: ssoTicket }),
        })
          .then((res) => res.json())
          .then((data) => {
            if (data?.success && data?.user) {
              const verifiedUser = data.user;
              if (verifiedUser.role === "therapist") {
                localStorage.setItem(CONSULTANT_STORAGE_KEY, JSON.stringify(verifiedUser));
              } else if (verifiedUser.role === "super_admin" || verifiedUser.role === "admin") {
                localStorage.setItem(ADMIN_STORAGE_KEY, JSON.stringify(verifiedUser));
              } else {
                localStorage.setItem(CLIENT_STORAGE_KEY, JSON.stringify(verifiedUser));
              }
              window.dispatchEvent(new Event("auth_state_change"));
            }
          })
          .catch(() => {});
      }
    }

    // 2. Immediate synchronous payload decode
    if (ssoTicket && !ssoRaw) {
      try {
        const b64 = ssoTicket.replace(/-/g, "+").replace(/_/g, "/");
        const jsonStr = atob(b64);
        const parsed = JSON.parse(jsonStr);
        if (parsed?.payload) {
          ssoRaw = encodeURIComponent(JSON.stringify(parsed.payload));
        }
      } catch {}
    }

    if (ssoRaw || ssoTicket) {
      let user: any = DEFAULT_CLIENT;
      if (ssoRaw) {
        try {
          user = JSON.parse(decodeURIComponent(ssoRaw));
        } catch {
          user = DEFAULT_CLIENT;
        }
      }

      if (user.role === "therapist") {
        localStorage.setItem(CONSULTANT_STORAGE_KEY, JSON.stringify(user));
        localStorage.removeItem(ADMIN_STORAGE_KEY);
        localStorage.removeItem(CLIENT_STORAGE_KEY);
      } else if (user.role === "super_admin" || user.role === "admin") {
        localStorage.setItem(ADMIN_STORAGE_KEY, JSON.stringify(user));
        localStorage.removeItem(CONSULTANT_STORAGE_KEY);
        localStorage.removeItem(CLIENT_STORAGE_KEY);
      } else {
        localStorage.setItem(CLIENT_STORAGE_KEY, JSON.stringify(user));
        localStorage.removeItem(ADMIN_STORAGE_KEY);
        localStorage.removeItem("admin_user");
        localStorage.removeItem("hexpertify_admin_token");
        localStorage.removeItem(CONSULTANT_STORAGE_KEY);
        localStorage.removeItem("consultant_token");
      }

      const url = new URL(window.location.href);
      url.searchParams.delete("sso_ticket");
      url.searchParams.delete("sso_user");
      url.searchParams.delete("sso");
      window.history.replaceState({}, document.title, url.pathname + url.search);
      return user;
    }
  } catch (e) {}
  return null;
}

// ── Client Auth ──
export function getClientAuth(): ClientAuthUser | null {
  try {
    checkSsoTransfer();
    const data = localStorage.getItem(CLIENT_STORAGE_KEY);
    if (!data) return null;
    return JSON.parse(data);
  } catch (e) {
    return null;
  }
}

export function setClientAuth(user: ClientAuthUser): void {
  try {
    localStorage.removeItem(ADMIN_STORAGE_KEY);
    localStorage.removeItem("admin_user");
    localStorage.removeItem("hexpertify_admin_token");
    localStorage.removeItem(CONSULTANT_STORAGE_KEY);
    localStorage.removeItem("consultant_token");
    localStorage.setItem(CLIENT_STORAGE_KEY, JSON.stringify(user));
    window.dispatchEvent(new Event("auth_state_change"));
  } catch (e) {}
}

export function isClientAuthenticated(): boolean {
  try {
    const sso = checkSsoTransfer();
    if (sso && sso.role === "client") return true;
    const data = localStorage.getItem(CLIENT_STORAGE_KEY);
    return !!data;
  } catch (e) {
    return false;
  }
}

export function logoutClient(): void {
  try {
    localStorage.removeItem(CLIENT_STORAGE_KEY);
    window.dispatchEvent(new Event("auth_state_change"));
  } catch (e) {}
}

// ── Consultant / Therapist Auth ──
export function getAuthUser(): ConsultantAuthUser | null {
  try {
    checkSsoTransfer();
    const data = localStorage.getItem(CONSULTANT_STORAGE_KEY);
    if (!data) return DEFAULT_CONSULTANT;
    return JSON.parse(data);
  } catch (e) {
    return DEFAULT_CONSULTANT;
  }
}

export function setAuthUser(user: ConsultantAuthUser): void {
  try {
    localStorage.setItem(CONSULTANT_STORAGE_KEY, JSON.stringify(user));
    window.dispatchEvent(new Event("auth_state_change"));
  } catch (e) {}
}

export function isAuthenticated(): boolean {
  try {
    const sso = checkSsoTransfer();
    if (sso && sso.role === "therapist") return true;
    const data = localStorage.getItem(CONSULTANT_STORAGE_KEY);
    return !!data;
  } catch (e) {
    return false;
  }
}

export function logoutUser(): void {
  try {
    localStorage.removeItem(CONSULTANT_STORAGE_KEY);
    window.dispatchEvent(new Event("auth_state_change"));
  } catch (e) {}
}

// ── Super Admin Auth ──
export function getAdminAuth(): AdminAuthUser | null {
  try {
    checkSsoTransfer();
    const data = localStorage.getItem(ADMIN_STORAGE_KEY);
    if (!data) return null;
    return JSON.parse(data);
  } catch (e) {
    return null;
  }
}

export function setAdminAuth(user: AdminAuthUser): void {
  try {
    localStorage.removeItem(CLIENT_STORAGE_KEY);
    localStorage.removeItem(CONSULTANT_STORAGE_KEY);
    localStorage.setItem(ADMIN_STORAGE_KEY, JSON.stringify(user));
    window.dispatchEvent(new Event("auth_state_change"));
  } catch (e) {}
}

export function isAdminAuthenticated(): boolean {
  try {
    const sso = checkSsoTransfer();
    if (sso && (sso.role === "super_admin" || sso.role === "admin")) return true;
    const data = localStorage.getItem(ADMIN_STORAGE_KEY);
    if (!data || data === 'logged_out') return false;
    const parsed = JSON.parse(data);
    return parsed?.role === "super_admin" || parsed?.role === "admin";
  } catch (e) {
    return false;
  }
}

export function logoutAdmin(): void {
  try {
    localStorage.removeItem(ADMIN_STORAGE_KEY);
    window.dispatchEvent(new Event("auth_state_change"));
  } catch (e) {}
}

// ── Global Sign Out ──
export function logoutAll(): void {
  try {
    localStorage.removeItem(CLIENT_STORAGE_KEY);
    localStorage.removeItem(CONSULTANT_STORAGE_KEY);
    localStorage.removeItem(ADMIN_STORAGE_KEY);
    window.dispatchEvent(new Event("auth_state_change"));
  } catch (e) {}
}
