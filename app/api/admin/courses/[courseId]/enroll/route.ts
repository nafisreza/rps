import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export async function POST(req: NextRequest, context: { params: Promise<{ courseId: string }> }) {
  const { courseId } = await context.params;
  const { studentIds } = await req.json();
  // Find all enrollments for this course
  const enrollments = await prisma.enrollment.findMany({ where: { courseId }, select: { id: true } });
  const enrollmentIds = enrollments.map(e => e.id);
  // Delete all related results first
  if (enrollmentIds.length > 0) {
    await prisma.result.deleteMany({ where: { enrollmentId: { in: enrollmentIds } } });
  }
  // Remove all enrollments for this course
  await prisma.enrollment.deleteMany({ where: { courseId } });
  // Add enrollments for selected students
  for (const studentId of studentIds) {
    await prisma.enrollment.create({ data: { studentId, courseId } });
  }
  return NextResponse.json({ ok: true });
}
