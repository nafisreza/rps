import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    const { email, password, role, name, departmentId, batch, studentId, currentSemester, designation } = await req.json();
    if (!email || !password || !role || !name || !departmentId || (role === "STUDENT" && (!batch || !studentId)) || (role === "TEACHER" && !designation)) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }
    const hashed = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { email, password: hashed, role },
    });
    if (role === "STUDENT") {
      await prisma.student.create({
        data: {
          userId: user.id,
          studentId,
          name,
          departmentId,
          batch,
          email,
          currentSemester: currentSemester ?? 1,
        },
      });
    } else if (role === "TEACHER") {
      await prisma.teacher.create({
        data: {
          userId: user.id,
          name,
          departmentId,
          email,
          designation,
        },
      });
    }
    return NextResponse.json({ user });
  } catch (e: any) {
    return NextResponse.json({ error: "Failed to create user", e }, { status: 500 });
  }
}
