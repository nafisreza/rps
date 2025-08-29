import { NextRequest } from "next/server";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

// GET: List all approved results for a student
export async function GET(req: NextRequest, context: { params: Promise<{ studentId: string }> }) {
  const { studentId } = await context.params;
  if (!studentId) {
    return new Response(JSON.stringify({ error: "Missing student id" }), { status: 400 });
  }
  // Fetch all enrollments and results for the student
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
  // Fetch all semester GPAs for the student
  const semesterGPAs = await prisma.semesterGPA.findMany({
    where: { studentId },
    orderBy: { semester: "asc" },
  });
  // Fetch student's current semester
  const student = await prisma.student.findUnique({ where: { id: studentId }, select: { currentSemester: true } });
  const currentSemester = student?.currentSemester;

  // Group results by semester
  const semesters: any[] = [];
  const semesterMap: Record<number, any> = {};
  // Group results by semester and calculate weighted GPA for each semester
  for (const enr of enrollments) {
    const course = enr.course;
    const result = enr.results[0];
    if (!result || typeof result.gradePoint !== "number" || typeof course.credit !== "number") continue;
    const sem = course.semester;
    if (!semesterMap[sem]) {
      semesterMap[sem] = { semester: sem, courses: [], gpa: null };
    }
    semesterMap[sem].courses.push({
      id: course.id,
      name: course.name,
      code: course.code,
      credit: course.credit,
      department: course.department?.name,
      program: course.program?.name,
      teacher: course.teacher?.name,
      grade: result.grade,
      gradePoint: result.gradePoint,
    });
  }
  // Calculate weighted GPA for each semester
  for (const sem of Object.values(semesterMap)) {
    let semTotalCredits = 0;
    let semWeightedSum = 0;
    for (const c of sem.courses) {
      if (typeof c.gradePoint === "number" && typeof c.credit === "number") {
        semTotalCredits += c.credit;
        semWeightedSum += c.gradePoint * c.credit;
      }
    }
    sem.gpa = semTotalCredits > 0 ? semWeightedSum / semTotalCredits : null;
  }
  // Sort semesters
  for (const sem of Object.values(semesterMap)) {
    semesters.push(sem);
  }
  semesters.sort((a, b) => a.semester - b.semester);

  // Calculate CGPA as weighted average of all approved courses
  let totalCredits = 0;
  let weightedSum = 0;
  for (const enr of enrollments) {
    const course = enr.course;
    const result = enr.results[0];
    if (!result || typeof result.gradePoint !== "number" || typeof course.credit !== "number") continue;
    totalCredits += course.credit;
    weightedSum += result.gradePoint * course.credit;
  }
  const cgpa = totalCredits > 0 ? weightedSum / totalCredits : null;

  return Response.json({ semesters, currentSemester, cgpa });
}
