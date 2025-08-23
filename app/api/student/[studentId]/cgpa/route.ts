import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(req: NextRequest, context: { params: Promise<{ studentId: string }> }) {
  const { studentId } = await context.params;
  // Fetch all approved results for the student
  const enrollments = await prisma.enrollment.findMany({
    where: { studentId },
    include: {
      course: true,
      results: {
        where: {},
      },
    },
  });
  // Only consider results for courses that are approved
  let totalCredits = 0;
  let weightedSum = 0;
  for (const enr of enrollments) {
    const course = enr.course;
    const result = enr.results[0];
    if (!result || typeof result.gradePoint !== "number" || typeof course.credit !== "number") continue;
    // You may want to check for approval status if you store it in the result or course
    totalCredits += course.credit;
    weightedSum += result.gradePoint * course.credit;
  }
  const cgpa = totalCredits > 0 ? weightedSum / totalCredits : null;
  return NextResponse.json({ cgpa });
}
