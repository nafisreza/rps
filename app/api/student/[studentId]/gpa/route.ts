import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(req: NextRequest, context: { params: Promise<{ studentId: string }> }) {
  const { studentId } = await context.params;
  const { searchParams } = new URL(req.url);
  const semester = Number(searchParams.get("semester"));
  if (!semester || isNaN(semester)) {
    return NextResponse.json({ error: "Missing or invalid semester" }, { status: 400 });
  }
  // Fetch all enrollments for this student and semester
  const enrollments = await prisma.enrollment.findMany({
    where: { studentId },
    include: {
      course: true,
      results: true,
    },
  });
  let totalCredits = 0;
  let weightedSum = 0;
  for (const enr of enrollments) {
    const course = enr.course;
    const result = enr.results[0];
    if (!result || typeof result.gradePoint !== "number" || typeof course.credit !== "number") continue;
    if (course.semester !== semester) continue;
    totalCredits += course.credit;
    weightedSum += result.gradePoint * course.credit;
  }
  const gpa = totalCredits > 0 ? weightedSum / totalCredits : null;
  // Store in SemesterGPA table
  if (gpa !== null) {
    await prisma.semesterGPA.upsert({
      where: { studentId_semester: { studentId, semester } },
      update: { gpa },
      create: { studentId, semester, gpa },
    });
  }
  return NextResponse.json({ gpa });
}
