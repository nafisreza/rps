import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export async function GET(req: NextRequest, context: { params: Promise<{ courseId: string }> }) {
  const { courseId } = await context.params;
  const course = await prisma.course.findUnique({
    where: { id: courseId },
    select: { semester: true, departmentId: true, programId: true },
  });
  if (!course) return NextResponse.json({ students: [] });
  const students = await prisma.student.findMany({
    where: {
      departmentId: course.departmentId,
      programId: course.programId,
      currentSemester: course.semester,
    },
    select: { id: true, name: true, studentId: true, batch: true, email: true },
  });
  return NextResponse.json({ students });
}
