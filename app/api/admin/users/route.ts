import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const role = searchParams.get("role");
  const department = searchParams.get("department");
  const batch = searchParams.get("batch");
  const designation = searchParams.get("designation");

  if (role === "STUDENT") {
    const students = await prisma.student.findMany({
      where: {
        department: department ? { name: department } : undefined,
        batch: batch ? batch : undefined,
      },
      include: { user: true, department: true },
    });
    return NextResponse.json({ students });
  } else if (role === "TEACHER") {
    const teachers = await prisma.teacher.findMany({
      where: {
        department: department ? { name: department } : undefined,
        designation: designation ? designation : undefined,
      },
      include: { user: true, department: true },
    });
    return NextResponse.json({ teachers });
  }
  return NextResponse.json({ error: "Invalid role" }, { status: 400 });
}
