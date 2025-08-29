import { NextRequest } from "next/server";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export async function GET(req: NextRequest, context: { params: Promise<{ studentId: string }> }) {
  const { studentId } = await context.params;
  if (!studentId) {
    return new Response(JSON.stringify({ error: "Missing student id" }), { status: 400 });
  }
  // Fetch student's current semester
  const student = await prisma.student.findUnique({ where: { id: studentId }, select: { currentSemester: true } });
  const currentSemester = student?.currentSemester;
  // Find all enrollments for this student
  const enrollments = await prisma.enrollment.findMany({
    where: { studentId },
    include: {
      course: {
        include: {
          department: true,
          program: true,
          teacher: true,
        },
      },
    },
  });
  // Get course objects
  const courses = enrollments.map((e) => e.course);
  // If ?current is present, filter to only current semester courses
  const url = new URL(req.url);
  const onlyCurrent = url.searchParams.has("current");
  const filteredCourses = onlyCurrent ? courses.filter(c => c.semester === currentSemester) : courses;
  return Response.json({ courses: filteredCourses });
}
