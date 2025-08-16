import { NextRequest } from "next/server";
import { PrismaClient } from "@prisma/client";
import { generateResultPdf } from "../../../../../../../lib/generateResultPdf";

const prisma = new PrismaClient();

export async function GET(req: NextRequest, context: { params: Promise<{ courseId: string }> }) {
  const { courseId } = await context.params;
  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type") === "locked" ? "locked" : "draft";

  // Fetch course info
  const course = await prisma.course.findUnique({
    where: { id: courseId },
    include: {
      department: true,
      program: true,
      teacher: true,
    },
  });
  if (!course) return new Response("Course not found", { status: 404 });

  // Fetch enrollments and results
  const enrollments = await prisma.enrollment.findMany({
    where: { courseId },
    include: {
      student: true,
      results: true,
    },
  });

  // Prepare students data for PDF
  const students = enrollments.map((enr) => {
    const m = enr.results[0] || {};
    return {
      studentId: enr.student.studentId,
      name: enr.student.name,
      attendance: m.attendance,
      quiz: [m.quiz1 || 0, m.quiz2 || 0, m.quiz3 || 0, m.quiz4 || 0].sort((a, b) => b - a).slice(0, 3).reduce((a, b) => a + b, 0),
      midterm: m.midterm,
      final: m.final,
      total: m.total,
      grade: m.grade,
    };
  });

  // Prepare course info for PDF
  const courseInfo = {
    name: course.name,
    code: course.code,
    credit: course.credit,
    department: course.department ? { name: course.department.name } : undefined,
    program: course.program ? { name: course.program.name } : undefined,
    faculty: course.teacher ? { name: course.teacher.name } : undefined,
  };

  const watermark = type === "draft" ? "DRAFT" : "LOCKED";
  const includeSignatures = type === "locked";
  const pdfBytes = await generateResultPdf({ course: courseInfo, students, watermark, includeSignatures });

  return new Response(pdfBytes, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename=${course.code || "result"}_${type}.pdf`,
    },
  });
}
