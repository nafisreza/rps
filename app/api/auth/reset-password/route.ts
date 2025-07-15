import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    const { email, code, password } = await req.json();
    if (!email || !code || !password) return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return NextResponse.json({ error: "No user with this email" }, { status: 404 });
    const token = await prisma.passwordResetToken.findFirst({
      where: {
        userId: user.id,
        code,
        used: false,
        expiresAt: { gt: new Date() },
      },
    });
    if (!token) return NextResponse.json({ error: "Invalid or expired code" }, { status: 400 });
    // Update password
    const hashed = await bcrypt.hash(password, 10);
    await prisma.user.update({ where: { id: user.id }, data: { password: hashed } });
    // Mark token as used
    await prisma.passwordResetToken.update({ where: { id: token.id }, data: { used: true } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: "Failed to reset password", e }, { status: 500 });
  }
}
