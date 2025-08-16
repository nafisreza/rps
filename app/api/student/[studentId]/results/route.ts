import { NextRequest } from "next/server";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

// GET: List all approved results for a student
export async function GET(req: NextRequest, context: { params: Promise<{ studentId: string }> }) {
  const { studentId } = await context.params;
  if (!studentId) {
    return new Response(JSON.stringify({ error: "Missing student id" }), { status: 400 });
  }
  // Find all enrollments for this student
  const enrollments = await prisma.enrollment.findMany({
    where: { studentId },
    include: {
      course: {
        include: {
          department: true,
          program: true,
          teacher: true,
          resultStatuses: true,
        },
      },
      results: true,
    },
  });
  // Only show results if course is approved
  const approvedCourses = enrollments.filter((e) =>
    e.course.resultStatuses.some((rs) => rs.status === "APPROVED")
  );
  // Map to grade/gpa info
  const results = approvedCourses.map((e) => {
    const r = e.results[0];
    return {
      course: {
        id: e.course.id,
        name: e.course.name,
        code: e.course.code,
        credit: e.course.credit,
        semester: e.course.semester,
        department: e.course.department?.name,
        program: e.course.program?.name,
        teacher: e.course.teacher?.name,
      },
      grade: r?.grade,
      gradePoint: r?.gradePoint,
    };
  });
  return Response.json({ results });
}
