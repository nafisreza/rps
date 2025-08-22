import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// GET: Get the current CourseResultStatus for a course and semester
export async function GET(req: NextRequest, context: { params: Promise<{ courseId: string }> }) {
  const { courseId } = await context.params;
  // Find the course to get the semester
  const course = await prisma.course.findUnique({ where: { id: courseId }, select: { semester: true } });
  if (!course) return NextResponse.json({ status: "PENDING" });
  const semester = course.semester;
  // Find the latest CourseResultStatus for this course and semester
  const resultStatus = await prisma.courseResultStatus.findFirst({
    where: { courseId, semester },
    orderBy: { updatedAt: "desc" },
  });
  return NextResponse.json(resultStatus || { status: "PENDING" });
}
