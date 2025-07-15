import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const role = searchParams.get("role");
  const departmentId = searchParams.get("departmentId");
  const programId = searchParams.get("programId");
  const batch = searchParams.get("batch");
  const designation = searchParams.get("designation");
  const name = searchParams.get("name");
  const studentId = searchParams.get("studentId");

  if (role === "student") {
    const students = await prisma.student.findMany({
      where: {
        departmentId: departmentId || undefined,
        programId: programId || undefined,
        batch: batch ? batch : undefined,
        name: name ? { contains: name, mode: "insensitive" } : undefined,
        studentId: studentId ? { contains: studentId, mode: "insensitive" } : undefined,
      },
      include: { user: true, department: true, program: true },
    });
    return NextResponse.json({ students });
  } else if (role === "teacher") {
    const teachers = await prisma.teacher.findMany({
      where: {
        departmentId: departmentId || undefined,
        designation: designation ? designation : undefined,
        name: name ? { contains: name, mode: "insensitive" } : undefined,
      },
      include: { user: true, department: true },
    });
    return NextResponse.json({ teachers });
  }
  return NextResponse.json({ error: "Invalid role" }, { status: 400 });
}
