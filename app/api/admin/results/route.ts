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
  return Response.json({ success: true });
}
