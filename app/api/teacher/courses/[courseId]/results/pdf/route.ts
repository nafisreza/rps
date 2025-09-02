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

  // Sort enrollments by studentId ascending
  const sortedEnrollments = [...enrollments].sort((a, b) => {
    const idA = a.student.studentId || "";
    const idB = b.student.studentId || "";
    const numA = Number(idA);
    const numB = Number(idB);
    if (!isNaN(numA) && !isNaN(numB)) {
      return numA - numB;
    }
    return idA.localeCompare(idB);
  });

  // Prepare students data for PDF
  const students = sortedEnrollments.map((enr) => {
    const m = enr.results[0] || {};
    // Attendance mark calculation
    const totalMark = course.credit * 100;
    const attendanceMax = totalMark * 0.1;
    let attendanceMark = 0;
    const attendancePercent = m.attendance || 0;
    if (attendancePercent >= 95) attendanceMark = attendanceMax;
    else if (attendancePercent >= 90) attendanceMark = attendanceMax * 0.8;
    else if (attendancePercent >= 80) attendanceMark = attendanceMax * 0.4;
    else if (attendancePercent >= 75) attendanceMark = attendanceMax * 0.2;
    else attendanceMark = 0;
    return {
      studentId: enr.student.studentId,
      name: enr.student.name,
      attendance: attendanceMark,
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

  return new Response(Buffer.from(pdfBytes), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename=${course.code || "result"}_${type}.pdf`,
    },
  });
}
