import { NextRequest } from "next/server";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

// GET: List all courses with submitted results (not draft)
export async function GET(req: NextRequest) {
  // Find all courses with status SUBMITTED (teacher has submitted, waiting for admin approval)
  const submittedCourses = await prisma.course.findMany({
    where: {
      resultStatuses: {
        some: { status: "SUBMITTED" }
      }
    },
    include: {
      department: true,
      program: true,
      teacher: true,
      resultStatuses: true,
    },
  });
  // Map to API shape
  const courses = submittedCourses.map((course) => {
    const statusObj = course.resultStatuses[0];
    return {
      id: course.id,
      name: course.name,
      code: course.code,
      credit: course.credit,
      semester: course.semester,
      department: course.department?.name,
      program: course.program?.name,
      teacher: course.teacher?.name,
      status: statusObj?.status === "SUBMITTED" ? "Submitted" : statusObj?.status === "APPROVED" ? "Approved" : "Pending",
      lockedPdfUrl: `/api/teacher/courses/${course.id}/results/pdf?type=locked`,
      approved: statusObj?.status === "APPROVED",
    };
  });
  return Response.json({ courses });
}

// POST: Approve a result
export async function POST(req: NextRequest) {
  const { courseId } = await req.json();
  if (!courseId) return Response.json({ error: "Missing courseId" }, { status: 400 });
  // Update status to APPROVED
  await prisma.courseResultStatus.updateMany({
    where: { courseId },
    data: { status: "APPROVED" },
  });

  // Find semester from course
  const course = await prisma.course.findUnique({ where: { id: courseId }, select: { semester: true } });
  const semester = course?.semester || 1;

  // Get all enrollments for this course
  const enrollments = await prisma.enrollment.findMany({ where: { courseId }, include: { student: true, course: true, results: true } });
  // Group enrollments by student
  const studentMap: Record<string, any[]> = {};
  for (const enr of enrollments) {
    if (!studentMap[enr.studentId]) studentMap[enr.studentId] = [];
    studentMap[enr.studentId].push(enr);
  }
  // For each student, calculate GPA for this semester
  for (const [studentId, enrList] of Object.entries(studentMap)) {
    let totalCredits = 0;
    let weightedSum = 0;
    for (const enr of enrList) {
      const course = enr.course;
      const result = enr.results[0];
      if (!result || typeof result.gradePoint !== "number" || typeof course.credit !== "number") continue;
      if (course.semester !== semester) continue;
      totalCredits += course.credit;
      weightedSum += result.gradePoint * course.credit;
    }
    const gpa = totalCredits > 0 ? weightedSum / totalCredits : null;
    if (gpa !== null) {
      await prisma.semesterGPA.upsert({
        where: { studentId_semester: { studentId, semester } },
        update: { gpa },
        create: { studentId, semester, gpa },
      });
    }
  }

  return Response.json({ success: true });
}
