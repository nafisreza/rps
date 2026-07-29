import { PrismaClient } from "@prisma/client";

export const BASE = "http://localhost:3000";

export const prisma = new PrismaClient();

export const ADMIN = { email: "admin@iut-dhaka.edu", password: "admin123" };

/**
 * Logs in through the real NextAuth credentials flow (CSRF token + callback)
 * and returns a Cookie header string, or null when authentication fails.
 */
export async function login(email: string, password: string): Promise<string | null> {
  const csrfRes = await fetch(`${BASE}/api/auth/csrf`);
  const { csrfToken } = await csrfRes.json();
  const csrfCookies = csrfRes.headers
    .getSetCookie()
    .map((c) => c.split(";")[0])
    .join("; ");

  const res = await fetch(`${BASE}/api/auth/callback/credentials`, {
    method: "POST",
    headers: {
      "content-type": "application/x-www-form-urlencoded",
      cookie: csrfCookies,
    },
    body: new URLSearchParams({ csrfToken, email, password, json: "true" }).toString(),
    redirect: "manual",
  });

  const sessionCookie = res.headers
    .getSetCookie()
    .map((c) => c.split(";")[0])
    .find((c) => c.includes("session-token") && !c.endsWith("="));
  if (!sessionCookie) return null;
  return [csrfCookies, sessionCookie].join("; ");
}

export async function getJson(path: string, cookie?: string) {
  const res = await fetch(`${BASE}${path}`, {
    headers: cookie ? { cookie } : undefined,
  });
  return { status: res.status, body: await res.json().catch(() => null) };
}

export async function postJson(path: string, body: unknown, cookie?: string) {
  const res = await fetch(`${BASE}${path}`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      ...(cookie ? { cookie } : {}),
    },
    body: JSON.stringify(body),
  });
  return { status: res.status, body: await res.json().catch(() => null) };
}
