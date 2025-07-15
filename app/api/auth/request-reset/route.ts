import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { sendPasswordResetEmail } from "../../../../lib/email";

const prisma = new PrismaClient();

function generateResetCode(length = 6) {
  return Array.from({ length }, () => Math.floor(Math.random() * 10)).join("");
}

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    if (!email) return NextResponse.json({ error: "Email required" }, { status: 400 });
    // Check if user exists
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return NextResponse.json({ error: "No user with this email" }, { status: 404 });
    // Generate code and expiry
    const code = generateResetCode();
    const expires = new Date(Date.now() + 15 * 60 * 1000); // 15 min
    // Store code and expiry in PasswordResetToken table
    await prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        code,
        expiresAt: expires,
      },
    });
    // Send code via email
    await sendPasswordResetEmail(email, code);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: "Failed to send reset code", e }, { status: 500 });
  }
}
