import { describe, it, expect, afterAll } from "vitest";
import { BASE, ADMIN, login, getJson, postJson, prisma } from "./helpers";

describe("Authentication & authorization API", () => {
  afterAll(async () => {
    await prisma.$disconnect();
  });

  it("TC-13: login succeeds with valid admin credentials and issues a session", async () => {
    const cookie = await login(ADMIN.email, ADMIN.password);
    expect(cookie).not.toBeNull();

    const session = await getJson("/api/auth/session", cookie!);
    expect(session.status).toBe(200);
    expect(session.body?.user?.email).toBe(ADMIN.email);
    expect(session.body?.user?.role).toBe("ADMIN");
  });

  it("TC-14: login is rejected with an incorrect password", async () => {
    const cookie = await login(ADMIN.email, "definitely-wrong-password");
    expect(cookie).toBeNull();
  });

  it("TC-15: admin users API rejects unauthenticated requests", async () => {
    const res = await getJson("/api/admin/users?role=student");
    expect(res.status).toBe(403);
    expect(res.body?.students).toBeUndefined();
  });

  it("TC-16: admin users API returns seeded students for an admin session", async () => {
    const cookie = await login(ADMIN.email, ADMIN.password);
    expect(cookie).not.toBeNull();

    const res = await getJson("/api/admin/users?role=student", cookie!);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body?.students)).toBe(true);
    const ids = res.body.students.map((s: { studentId: string }) => s.studentId);
    expect(ids).toContain("20250001");
  });

  it("TC-17: change-password API rejects unauthenticated requests", async () => {
    const res = await fetch(`${BASE}/api/auth/change-password`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ password: "Valid*Pass1" }),
    });
    expect(res.status).toBe(401);
  });
});
